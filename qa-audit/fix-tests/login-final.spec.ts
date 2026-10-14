import { test, expect, Page } from '@playwright/test';
const id='00000000-0000-4000-8000-000000000002';
async function auth(page:Page, options:{signedIn?:boolean;confirmed?:boolean;admin?:boolean;expired?:boolean}={}) {
 // Any mutation not handled by the specific QA routes below is blocked.
 await page.route('**/*', r => ['POST','PATCH','PUT','DELETE'].includes(r.request().method()) ? r.abort() : r.fallback());
 const user={id,email:'qa_test@example.invalid',email_confirmed_at:options.confirmed===false?null:'2026-10-14T00:00:00Z',app_metadata:{provider:'email'},user_metadata:{}};
 const profile={id,email:user.email,full_name:'QA_TEST_LOGIN',role:options.admin?'admin':'user',status:'active',is_verified:true,total_points:0};
 const token=Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:id,exp:4102444800})).toString('base64url')+'.QA_TEST_SIGNATURE';
 const session={user,access_token:token,refresh_token:'QA_TEST_REFRESH',expires_in:3600,expires_at:4102444800,token_type:'bearer'};
 await page.addInitScript(({signedIn,session,expired})=>{localStorage.setItem('datacamp_language','en');if(signedIn&&!sessionStorage.getItem('QA_TEST_INITIALIZED')){sessionStorage.setItem('datacamp_supabase_auth_token',JSON.stringify({...session,expires_at:expired?1:session.expires_at}));sessionStorage.setItem('QA_TEST_INITIALIZED','true');}},{signedIn:options.signedIn,session,expired:options.expired});
 const calls:{path:string;method:string;body:any}[]=[];
 await page.route((process.env.QA_SUPABASE_URL || 'https://qa-test.supabase.co')+'/**',async r=>{
  const request=r.request(),url=new URL(request.url());let body:any=null;try{body=request.postDataJSON()}catch{}
  calls.push({path:url.pathname+url.search,method:request.method(),body});let data:any=[];
  if(url.pathname.endsWith('/token'))data=session;
  else if(url.pathname.endsWith('/signup'))data={user,session:null};
  else if(url.pathname.endsWith('/user'))data=user;
  else if(url.pathname.endsWith('/profiles'))data=request.headers().accept?.includes('vnd.pgrst.object')?profile:[profile];
  else if(url.pathname.endsWith('/rpc/get_own_member_card'))data={token:'00000000-0000-4000-8000-000000000020'};
  else if(url.pathname.endsWith('/rpc/public_stats'))data={members:0,events:0,projects:0,certificates:0};
  else if(url.pathname.includes('/auth/v1/'))data={};
  await r.fulfill({contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:''}));
 return {calls,user,profile,session};
}
const enter=async(page:Page)=>{await page.locator('input[type="email"]').fill(' QA_TEST@example.invalid ');await page.locator('input[autocomplete="current-password"]').fill('QA_TEST_Strong1!');await page.getByRole('button',{name:'CONNECT_TO_NETWORK',exact:true}).click();};

test('email login validates, retries wrong credentials, preserves intended member route and survives reload/logout',async({page})=>{
 const app=await auth(page);await page.goto('/my-courses');await expect(page).toHaveURL(/login/);await page.getByRole('button',{name:'CONNECT_TO_NETWORK',exact:true}).click();await expect(page.getByText('Email is required.',{exact:true})).toBeVisible();expect(app.calls.filter(c=>c.path.includes('/token'))).toHaveLength(0);
 await page.route('**/auth/v1/token*',r=>r.fulfill({status:400,contentType:'application/json',body:'{"msg":"Invalid login credentials","code":"invalid_credentials"}'}));await enter(page);await expect(page.getByText('البريد الإلكتروني أو كلمة المرور غير صحيحة.',{exact:true})).toBeVisible();await expect(page).toHaveURL(/login/);await page.unroute('**/auth/v1/token*');await enter(page);await expect(page).toHaveURL(/my-courses/);expect(app.calls.find(c=>c.path.includes('grant_type=password'))?.body.email).toBe('qa_test@example.invalid');await page.reload();await expect(page).toHaveURL(/my-courses/);await page.goto('/profile');await page.getByRole('button',{name:'SIGN_OUT',exact:true}).click();await expect(page).toHaveURL(/login/);await page.reload();await page.goto('/profile');await expect(page).toHaveURL(/login/);expect(await page.evaluate(()=>sessionStorage.getItem('datacamp_supabase_auth_token'))).toBeNull();
});
test('admin email login returns to requested admin tab',async({page})=>{
 await auth(page,{admin:true});await page.goto('/admin/users');await enter(page);await expect(page).toHaveURL(/admin\/users/);await expect(page.getByRole('button',{name:'ADD OPERATIVE',exact:true})).toBeVisible();
});
test('unconfirmed Auth identity cannot bypass verification using a verified profile flag',async({page})=>{
 await auth(page,{signedIn:true,confirmed:false});await page.goto('/dashboard');await expect(page).toHaveURL(/verify-email/);await page.getByRole('button',{name:'CHECK_VERIFICATION_STATUS',exact:true}).click();await expect(page.getByText('Email not verified yet. Please check your inbox.',{exact:true})).toBeVisible();
});
test('registration without a session retains verification email, resends and offers login after confirmation',async({page})=>{
 const app=await auth(page);await page.goto('/register');const inputs=page.locator('form input');await inputs.nth(0).fill('QA_TEST_MEMBER');await inputs.nth(1).fill('QA_TEST@example.invalid');await inputs.nth(2).fill('QA_TEST_Strong1!');await inputs.nth(3).fill('QA_TEST_Strong1!');await page.locator('form button[type="submit"]').click();await expect(page).toHaveURL(/verify-email/);await expect(page.getByText('qa_test@example.invalid',{exact:true})).toBeVisible();await page.reload();await expect(page).toHaveURL(/verify-email/);await page.getByRole('button',{name:'RESEND_VERIFICATION_LINK',exact:true}).click();await expect(page.getByText('Verification email sent. Check your inbox.',{exact:true})).toBeVisible();expect(app.calls.find(c=>c.path.includes('/resend'))?.body.email).toBe('qa_test@example.invalid');expect(app.calls.find(c=>c.path.includes('/signup'))?.path).toContain('auth%2Fcallback');await page.getByRole('button',{name:'SIGN IN AFTER VERIFICATION',exact:true}).click();await expect(page).toHaveURL(/login/);
});
test('recovery request surfaces provider failure, retries and sends the canonical reset redirect',async({page})=>{
 const app=await auth(page);await page.goto('/forgot-password');await page.locator('input').fill('QA_TEST@example.invalid');await page.route('**/auth/v1/recover*',r=>r.fulfill({status:429,contentType:'application/json',body:'{"msg":"QA_TEST_EMAIL_LIMIT"}'}));await page.getByRole('button',{name:'SEND_RECOVERY_CODE',exact:true}).click();await expect(page.getByText('QA_TEST_EMAIL_LIMIT',{exact:true})).toBeVisible();await page.unroute('**/auth/v1/recover*');await page.getByRole('button',{name:'SEND_RECOVERY_CODE',exact:true}).click();await expect(page.getByText('TRANSMISSION_SENT',{exact:true})).toBeVisible();expect(app.calls.find(c=>c.path.includes('/recover'))?.path).toContain('reset-password');
});
test('password recovery rejects weak/mismatched inputs, persists success and really ends its session',async({page})=>{
 const app=await auth(page,{signedIn:true});await page.goto('/reset-password');const inputs=page.locator('form input');await inputs.nth(0).fill('weak');await inputs.nth(1).fill('weak');await page.locator('form button[type="submit"]').click();await expect(page.getByText('Password must be at least 8 characters long.',{exact:true})).toBeVisible();await inputs.nth(0).fill('QA_TEST_Strong1!');await inputs.nth(1).fill('QA_TEST_Other1!');await page.locator('form button[type="submit"]').click();await expect(page.getByText('Passwords do not match',{exact:true})).toBeVisible();await inputs.nth(1).fill('QA_TEST_Strong1!');await page.locator('form button[type="submit"]').click();await expect(page.getByRole('button',{name:'PROCEED TO LOGIN',exact:true})).toBeVisible();expect(app.calls.filter(c=>c.method==='PUT'&&c.path.includes('/user'))).toHaveLength(1);await page.getByRole('button',{name:'PROCEED TO LOGIN',exact:true}).click();await expect(page).toHaveURL(/login/);await page.reload();await expect(page).toHaveURL(/login/);
});
test('expired recovery/callback links show actionable errors instead of false sign-in',async({page})=>{
 await auth(page);await page.goto('/reset-password#error=access_denied&error_description=Expired');await expect(page.getByRole('button',{name:'Request new recovery link',exact:true})).toBeVisible();await page.getByRole('button',{name:'Request new recovery link',exact:true}).click();await expect(page).toHaveURL(/forgot-password/);await page.goto('/auth/callback');await expect(page.getByRole('alert')).toContainText('invalid or expired');await page.getByRole('button',{name:'Return to login',exact:true}).click();await expect(page).toHaveURL(/login/);
});
test('callback honors internal destinations, rejects external redirect and never manually exchanges twice',async({page})=>{
 const app=await auth(page,{signedIn:true});await page.addInitScript(()=>sessionStorage.setItem('datacamp_auth_redirect','//evil.example'));await page.goto('/auth/callback');await expect(page).toHaveURL(/dashboard/);expect(app.calls.filter(c=>c.path.includes('grant_type=pkce'))).toHaveLength(0);
});
test('Google button requests canonical callback and account selection; cancellation is actionable',async({page})=>{
 await auth(page);let target='';await page.route('**/auth/v1/authorize*',async r=>{target=r.request().url();await r.fulfill({contentType:'text/html',body:'<h1>QA_TEST_PROVIDER</h1>'});});await page.goto('/login');await page.getByRole('button',{name:'CONTINUE WITH GOOGLE',exact:true}).click();await expect.poll(()=>target).toContain('prompt=select_account');expect(target).toContain('auth%2Fcallback');await page.goto('/auth/callback?error=access_denied&error_description=QA_TEST_CANCELLED');await expect(page.getByRole('alert')).toContainText('QA_TEST_CANCELLED');await expect(page.getByRole('button',{name:'Return to login',exact:true})).toBeVisible();
});
test('expired refresh token returns to login without retaining administrative access',async({page})=>{
 await auth(page,{signedIn:true,expired:true,admin:true});await page.route('**/auth/v1/token*',r=>r.fulfill({status:400,contentType:'application/json',body:'{"msg":"Refresh token expired","code":"refresh_token_not_found"}'}));await page.goto('/admin/users');await expect(page).toHaveURL(/login/);await expect(page.getByRole('button',{name:'ADD OPERATIVE',exact:true})).toHaveCount(0);
});
test('fresh server email confirmation refreshes the session instead of looping back to verification',async({page})=>{
 const app=await auth(page,{signedIn:true,confirmed:false});await page.goto('/verify-email');await expect(page.getByRole('button',{name:'CHECK_VERIFICATION_STATUS',exact:true})).toBeVisible();app.user.email_confirmed_at='2026-10-14T00:00:00Z';await page.getByRole('button',{name:'CHECK_VERIFICATION_STATUS',exact:true}).click();await expect(page).toHaveURL(/dashboard/);await page.reload();await expect(page).toHaveURL(/dashboard/);
});
test('SDK exchanges a PKCE callback once and password visibility is keyboard accessible',async({page})=>{
 const app=await auth(page);await page.addInitScript(()=>sessionStorage.setItem('datacamp_supabase_auth_token-code-verifier',JSON.stringify('QA_TEST_VERIFIER')));await page.goto('/auth/callback?code=QA_TEST_SINGLE_USE');await expect(page).toHaveURL(/dashboard/);expect(app.calls.filter(c=>c.path.includes('grant_type=pkce'))).toHaveLength(1);await page.goto('/profile');await page.getByRole('button',{name:'SIGN_OUT',exact:true}).click();await page.getByRole('button',{name:'Show password',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('input[autocomplete="current-password"]')).toHaveAttribute('type','text');await page.getByRole('button',{name:'Hide password',exact:true}).click();await expect(page.locator('input[autocomplete="current-password"]')).toHaveAttribute('type','password');
});
