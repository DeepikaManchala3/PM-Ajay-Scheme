# Executing Agency Login Credentials

All executing agencies have been configured with the following login credentials:

**Password for all accounts:** `Test123!`

## Login Credentials List

| # | Agency Name | Email | Password |
|---|-------------|-------|----------|
| 1 | Patel Construction Company | patel.construction@pmajay.gov.in | Test123! |
| 2 | Aneel Infrastructure Ltd | aneel.infra@pmajay.gov.in | Test123! |
| 3 | BuildPro Contractors | buildpro@pmajay.gov.in | Test123! |
| 4 | Metro Engineering Services | metro.eng@pmajay.gov.in | Test123! |
| 5 | Prime Builders Association | prime.builders@pmajay.gov.in | Test123! |
| 6 | Global Infrastructure Group | global.infra@pmajay.gov.in | Test123! |
| 7 | Elite Engineering Solutions | elite.eng@pmajay.gov.in | Test123! |
| 8 | Skyline Builders | skyline.builders@pmajay.gov.in | Test123! |
| 9 | Urban Development Corp | urban.dev@pmajay.gov.in | Test123! |
| 10 | Precision Engineering Ltd | precision.eng@pmajay.gov.in | Test123! |
| 11 | Apex Construction Services | apex.const@pmajay.gov.in | Test123! |
| 12 | National Infrastructure Partners | national.infra@pmajay.gov.in | Test123! |
| 13 | TechBuild Engineering | techbuild@pmajay.gov.in | Test123! |
| 14 | Royal Contractors | royal.contractors@pmajay.gov.in | Test123! |
| 15 | Smart Infrastructure Solutions | smart.infra@pmajay.gov.in | Test123! |
| 16 | Advanced Engineering Works | advanced.eng@pmajay.gov.in | Test123! |
| 17 | Diamond Builders Group | diamond.builders@pmajay.gov.in | Test123! |
| 18 | Mega Infrastructure Ltd | mega.infra@pmajay.gov.in | Test123! |
| 19 | Innovative Engineering Co | innovative.eng@pmajay.gov.in | Test123! |
| 20 | Supreme Construction Works | supreme.const@pmajay.gov.in | Test123! |

## How to Create These Users

To create these users in Supabase:

1. **Add Service Role Key to .env:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   You can find this in your Supabase project settings under API.

2. **Run the script:**
   ```bash
   cd backend
   node create_ea_users.js
   ```

The script will:
- Create auth users in `auth.users` table
- Create profiles in `profiles` table with role `executing_agency`
- Create records in `executing_agencies` table
- Set all passwords to `Test123!`

## Manual Creation (Alternative)

If you prefer to create users manually in Supabase Dashboard:

1. Go to Authentication → Users
2. Click "Add User"
3. Enter email from the list above
4. Set password to `Test123!`
5. Confirm email automatically
6. Add user metadata: `{"role": "executing_agency"}`
7. Repeat for all 20 agencies
