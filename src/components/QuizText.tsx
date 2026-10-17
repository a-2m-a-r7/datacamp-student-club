import React from 'react';

/** Render educational code as text, retaining indentation without interpreting HTML. */
export function QuizText({text}:{text:string}){
 const parts:React.ReactNode[]=[];let offset=0;
 for(const match of text.matchAll(/```(?:[\w+-]+)?[ \t]*\r?\n([\s\S]*?)```/g)){
  if(match.index!>offset)parts.push(text.slice(offset,match.index));
  parts.push(<code key={match.index} data-quiz-code dir="ltr" className="my-2 block overflow-x-auto whitespace-pre-wrap rounded-md bg-black/35 p-3 text-left font-mono text-sm font-normal">{match[1].replace(/\r?\n$/,'')}</code>);
  offset=match.index!+match[0].length;
 }
 if(offset<text.length)parts.push(text.slice(offset));
 return <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">{parts}</span>;
}
