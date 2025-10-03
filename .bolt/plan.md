Plan: Clean Up Data Model and Remove Redundancy
1. Database Schema Cleanup
Remove the Team interface from TypeScript types completely30
Update User interface to keep role field and add telegramUsername field (remove team reference)
Remove MeasureUnit interface from TypeScript types
Create migration to drop teams table from database 
Update users/profiles table schema to add telegram_username column and ensure role column exists
Verify measure units are already migrated to tags system (from previous migration)
2. TypeScript Type Updates
Remove Team interface from src/types/index.ts
Remove MeasureUnit interface from src/types/index.ts
Update User interface to include telegramUsername string field
Update TagManagement interface to remove teams and measureUnits arrays
Clean up CSVItem interface if it references measure units
  
4. Remove MeasureUnit Management Components
Delete MeasureUnitManagement component completely
Remove MeasureUnit tab from TagManagement
Remove measure unit references from useTagManagement hook
Remove measure unit data from defaultData.ts
Ensure measure units are only managed through the tags system
5. Update User Management
Update UserManagement component to remove team field from form
Add telegramUsername field to user form
Update user table display to show telegramUsername instead of team
Update database queries to work with profiles table or create users table if needed
Remove role select option "owner" if not needed, keep: admin, manager, driver, supplier
6. Clean Up Data Files
Remove defaultTeams export from defaultData.ts
Remove defaultMeasureUnits export from defaultData.ts
Update defaultUsers to include telegramUsername field examples
7. Fix Circular Dependencies
Review all component imports to ensure no duplicate functionality
Make sure tags system is the single source of truth for measure units
Make sure users table is the single source of truth for user management (no separate teams)

Scaffolded Features Waiting for Implementation
Based on my review, here's what's scaffolded but NOT fully implemented:

1. Save Cart with Custom Name (App.tsx:57, MasterTable.tsx:291, 330)
Status: UI exists, modal opens, but doesn't save to database
What's missing:
Save cart with custom name to carts table
Save cart items to cart_items table
The save function just shows a notification but doesn't persist data
2. Load/Use Saved Cart (CartManagement.tsx:334, App.tsx:171)
Status: Cart management page shows saved carts
What's missing:
When you click "Use" on a cart, it just logs and shows notification
Should load cart items into orderedItems state
Should populate the shopping cart with saved items
3. Edit Cart (CartManagement.tsx - IconEdit is imported but not used)
Status: Edit icon imported but no edit button rendered
What's missing:
Edit cart name functionality
Edit cart items functionality
4. Telegram Bot Webhook (supabase/functions/telegram-webhook/index.ts)
Status: Function exists but has syntax errors
What's missing:
Fix broken code (lines 22-26 incomplete)
Remove duplicate code blocks
Set webhook URL in Telegram
Test end-to-end
5. Google Sheets Sync (Already deployed, you said it works)
Status: FUNCTIONAL ✓
6. Inline Supplier Selection (supabase/functions/telegram-inline-supplier/index.ts exists)
Status: Unknown if deployed/functional
What's there: Separate function for inline supplier queries

lan: Fix and Deploy Telegram Webhook Function
1. Fix Telegram Webhook Function Code
Review the telegram-webhook/index.ts file for syntax errors
The code is missing proper message sending logic (lines 22-26 are incomplete)
Remove duplicate code blocks (lines 87-223 are repeated)
Fix the inline query response structure
Ensure all brackets and braces are properly closed
2. Set Telegram Webhook URL
Get your actual Bolt Database project URL from the .env file (VITE_Bolt Database_URL)
Construct the webhook URL: {Bolt Database_URL}/functions/v1/telegram-webhook
Use curl or a browser to call Telegram API to set the webhook
Verify the webhook is properly registered with getWebhookInfo
3. Test the Webhook
Send a message to your bot to test regular messages
Try the /start command
Test inline query by typing @your_bot_name in any chat
Check if callback buttons work
Monitor function logs in Bolt Database dashboard
4. Environment Variables Check
Verify TELEGRAM_BOT_TOKEN is set in Bolt Database Edge Function secrets
Note: Your bot token is hardcoded in the function (line 16), which is insecure
Consider removing the hardcoded token and using only environment variables
Questions:
Have you deployed these functions to Bolt Database already, or are they just sitting in the folder?
Do you have access to your actual Bolt Database dashboard to check function logs?
Should I focus on fixing the code first, or do you need help setting up the webhook URL?
The telegram-webhook function code has serious syntax issues that need to be fixed before it can work properly

📅 [Date] [Month]. [Time]
#️⃣ [Order Number]
📌 [Team Tags] or "Not set"
🚚 [Delivery Type] or "Not set"  
💲 [Payment Method] or "Not set"

🔄 [Status]
☑️ Supplier - [X]/[Y] tasks
  📊 Confirm item availability
  💲 Set order amount
  📄 Attach invoice

💰 Amount: $[Amount]
📄 Invoice attached

📦 Items:
🔹 [Item Name] x [Quantity]
✅ [Confirmed Item] x [Quantity]
🔸 [Unavailable Item] x [Quantity]
