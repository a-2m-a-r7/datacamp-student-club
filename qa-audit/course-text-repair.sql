BEGIN;

-- Repair only fully reversible Arabic UTF-8 text previously read as a western
-- single-byte encoding. Correct Arabic, ordinary Latin text and ambiguous
-- mixed/unrecoverable strings remain unchanged. No records are deleted.
CREATE OR REPLACE FUNCTION public.dc_repair_arabic_encoding(original text)
RETURNS text LANGUAGE plpgsql IMMUTABLE STRICT SET search_path=public AS $$
DECLARE candidate text:=original; repaired text; i integer;
 unicode_points integer[]:=ARRAY[8364,8218,402,8222,8230,8224,8225,710,8240,352,8249,338,381,8216,8217,8220,8221,8226,8211,8212,732,8482,353,8250,339,382,376];
 byte_points integer[]:=ARRAY[128,130,131,132,133,134,135,136,137,138,139,140,142,145,146,147,148,149,150,151,152,153,154,155,156,158,159];
BEGIN
 IF candidate !~ '[ØÙ]' THEN RETURN original; END IF;
 repaired:=candidate;
 FOR i IN 1..array_length(unicode_points,1) LOOP
  repaired:=replace(repaired,chr(unicode_points[i]),chr(byte_points[i]));
 END LOOP;
 BEGIN repaired:=convert_from(convert_to(repaired,'LATIN1'),'UTF8');
 EXCEPTION WHEN OTHERS THEN RETURN original;
 END;
 IF repaired !~ '[؀-ۿ]' THEN RETURN original; END IF;
 RETURN repaired;
END;$$;
REVOKE ALL ON FUNCTION public.dc_repair_arabic_encoding(text) FROM PUBLIC,anon,authenticated,service_role;

UPDATE public.courses SET
 title=public.dc_repair_arabic_encoding(title),
 description=public.dc_repair_arabic_encoding(description),
 short_description=public.dc_repair_arabic_encoding(short_description),
 instructor_name=public.dc_repair_arabic_encoding(instructor_name),
 instructor_title=public.dc_repair_arabic_encoding(instructor_title)
WHERE title IS DISTINCT FROM public.dc_repair_arabic_encoding(title)
 OR description IS DISTINCT FROM public.dc_repair_arabic_encoding(description)
 OR short_description IS DISTINCT FROM public.dc_repair_arabic_encoding(short_description)
 OR instructor_name IS DISTINCT FROM public.dc_repair_arabic_encoding(instructor_name)
 OR instructor_title IS DISTINCT FROM public.dc_repair_arabic_encoding(instructor_title);

-- No reviews means no measured rating; old defaults of five were fabricated.
UPDATE public.lessons SET
 title=public.dc_repair_arabic_encoding(title),
 content=public.dc_repair_arabic_encoding(content)
WHERE title IS DISTINCT FROM public.dc_repair_arabic_encoding(title)
 OR content IS DISTINCT FROM public.dc_repair_arabic_encoding(content);

ALTER TABLE public.courses ALTER COLUMN rating SET DEFAULT 0;
UPDATE public.courses SET rating=0 WHERE COALESCE(rating_count,0)=0 AND rating<>0;
COMMIT;
