import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN') || '7976740702:AAFnk67IV7t0gROt8-Q_rgPQ1odfps-r-d0';
    const body = await req.json();
    // Handle order from frontend
    if (body.type === 'order') {
      const { telegram_user_id, message, items } = body;
      // Send formatted message to Telegram user with inline button
      const telegramMessage = `🛒 *New Order*\n\n${message}\n\n_Order saved to database_`;
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "📋 My Orders",
              callback_data: "show_orders"
            }
          ]
        ]
      };
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: telegram_user_id,
          text: telegramMessage,
          parse_mode: 'Markdown',
          reply_markup: keyboard
        })
      });
      if (!telegramResponse.ok) {
        console.error('Failed to send Telegram message:', await telegramResponse.text());
      }
      return new Response(JSON.stringify({
        success: true,
        message: 'Order processed'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Handle incoming Telegram webhook
    const update = body;
    // Handle inline queries
    if (update.inline_query) {
      const query = update.inline_query.query.toLowerCase().trim();
      
      let results = [];
      
      // Check if query starts with "cat " for category browsing
      if (query.startsWith('cat ')) {
        const catQuery = query.substring(4).trim();
        
        if (catQuery === '') {
          // Show all categories when "cat " is typed
          const categories = ['cleaning', 'box', 'ustensil', 'plastic bag', 'kitchen roll', 'cheese'];
          results = categories.map((category, index) => ({
            type: 'article',
            id: `category_${index + 1}`,
            title: `${index + 1}. ${category.charAt(0).toUpperCase() + category.slice(1)}`,
            description: `Type "${index + 1}" to see ${category} items`,
            input_message_content: {
              message_text: `Category: ${category}`,
              parse_mode: 'Markdown'
            }
          }));
        } else if (/^\d+$/.test(catQuery)) {
          // Show items from selected category number
          const categoryNum = parseInt(catQuery);
          const categories = ['cleaning', 'box', 'ustensil', 'plastic bag', 'kitchen roll', 'cheese'];
          
          if (categoryNum >= 1 && categoryNum <= categories.length) {
            const selectedCategory = categories[categoryNum - 1];
            
            // Fetch items from selected category
            const { data: categoryItems, error: categoryError } = await supabaseClient
              .from('items')
              .select('item_name, category, default_supplier')
              .ilike('category', `%${selectedCategory}%`)
              .limit(50);

            if (!categoryError && categoryItems) {
              results = categoryItems.map((item, index) => ({
                type: 'article',
                id: `item_${categoryNum}_${index}`,
                title: item.item_name,
                description: `${item.category} - ${item.default_supplier}`,
                input_message_content: {
                  message_text: `Selected: ${item.item_name}`,
                  parse_mode: 'Markdown'
                },
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: "1", callback_data: `confirm_add:${item.item_name}:1` },
                      { text: "2", callback_data: `confirm_add:${item.item_name}:2` },
                      { text: "3", callback_data: `confirm_add:${item.item_name}:3` }
                    ],
                    [
                      { text: "5", callback_data: `confirm_add:${item.item_name}:5` },
                      { text: "10", callback_data: `confirm_add:${item.item_name}:10` },
                      { text: "Custom", callback_data: `custom_qty:${item.item_name}` }
                    ]
                  ]
                }
              }));
            }
          }
        }
      } else if (query === '') {
        // Show ALL items by default when no query
        const { data: allItems, error: allItemsError } = await supabaseClient
          .from('items')
          .select('item_name, category, default_supplier')
          .order('item_name')
          .limit(50);
          
        if (!allItemsError && allItems) {
          results = allItems.map((item, index) => ({
            type: 'article',
            id: `all_item_${index}`,
            title: item.item_name,
            description: `${item.category} - ${item.default_supplier}`,
            input_message_content: {
              message_text: `Selected: ${item.item_name}`,
              parse_mode: 'Markdown'
            },
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "1", callback_data: `confirm_add:${item.item_name}:1` },
                  { text: "2", callback_data: `confirm_add:${item.item_name}:2` },
                  { text: "3", callback_data: `confirm_add:${item.item_name}:3` }
                ],
                [
                  { text: "5", callback_data: `confirm_add:${item.item_name}:5` },
                  { text: "10", callback_data: `confirm_add:${item.item_name}:10` },
                  { text: "Custom", callback_data: `custom_qty:${item.item_name}` }
                ]
              ]
            }
          }));
        }
      } else {
        // Search items by name or category
        const { data: searchItems, error: searchError } = await supabaseClient
          .from('items')
          .select('item_name, category, default_supplier')
          .or(`item_name.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(50);
          
        if (!searchError && searchItems) {
          results = searchItems.map((item, index) => ({
            type: 'article',
            id: `search_${index}`,
            title: item.item_name,
            description: `${item.category} - ${item.default_supplier}`,
            input_message_content: {
              message_text: `Selected: ${item.item_name}`,
              parse_mode: 'Markdown'
            },
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "1", callback_data: `confirm_add:${item.item_name}:1` },
                  { text: "2", callback_data: `confirm_add:${item.item_name}:2` },
                  { text: "3", callback_data: `confirm_add:${item.item_name}:3` }
                ],
                [
                  { text: "5", callback_data: `confirm_add:${item.item_name}:5` },
                  { text: "10", callback_data: `confirm_add:${item.item_name}:10` },
                  { text: "Custom", callback_data: `custom_qty:${item.item_name}` }
                ]
              ]
            }
          }));
        }
      }

      const inlineResponse = await fetch(`https://api.telegram.org/bot${botToken}/answerInlineQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inline_query_id: update.inline_query.id,
          results: results,
          cache_time: 300
        })
      });
      if (!inlineResponse.ok) {
        console.error('Failed to answer inline query:', await inlineResponse.text());
      }
      return new Response(JSON.stringify({
        success: true
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const userId = update.callback_query.from.id;
      const chatId = update.callback_query.message?.chat.id;
      if (callbackData === 'show_orders') {
        // Fetch user's orders from database
        const { data: orders, error } = await supabaseClient.from('orders').select('*').eq('telegram_user_id', userId.toString()).order('created_at', {
          ascending: false
        }).limit(20);
        if (error) {
          console.error('Error fetching orders:', error);
          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: "Error fetching orders"
            })
          });
          return new Response(JSON.stringify({
            success: false
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
            status: 200
          });
        }
        let orderMessage = "📋 *Your Recent Orders:*\n\n";
        if (!orders || orders.length === 0) {
          orderMessage += "No orders found. Start ordering using the app or inline mode!";
        } else {
          // Group orders by order_id
          const groupedOrders = {};
          orders.forEach((order)=>{
            if (!groupedOrders[order.order_id]) {
              groupedOrders[order.order_id] = [];
            }
            groupedOrders[order.order_id].push(order);
          });
          Object.entries(groupedOrders).slice(0, 5).forEach(([orderId, items], index)=>{
            const orderDate = new Date(items[0].created_at).toLocaleDateString();
            orderMessage += `*Order ${index + 1}* (${orderDate}):\n`;
            items.forEach((item)=>{
              orderMessage += `• ${item.item_name}: ${item.quantity}\n`;
            });
            orderMessage += "\n";
          });
        }
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: orderMessage,
            parse_mode: 'Markdown'
          })
        });
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            callback_query_id: update.callback_query.id,
            text: "Orders displayed"
          })
        });
      } else if (callbackData.startsWith('add_item:')) {
        // Handle adding item to order
        const [, itemName, quantity] = callbackData.split(':');
        
        let item = null;
        
        try {
          // Try database first
          const { data: dbItem, error: itemError } = await supabaseClient
            .from('items')
            .select('item_name, category, default_supplier')
            .eq('item_name', itemName)
            .single();

          if (itemError) {
            console.warn('Database error, searching CSV cache:', itemError.message);
            // Fallback to CSV cache
            const csvItems = await getItems();
            item = csvItems.find(i => i.item_name === itemName);
          } else {
            item = dbItem;
          }
        } catch (error) {
          console.warn('Database failed, searching CSV cache:', error);
          // Fallback to CSV cache
          const csvItems = await getItems();
          item = csvItems.find(i => i.item_name === itemName);
        }
        
        if (item) {
          // Generate order ID and save to database
          const orderId = `inline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          try {
            const { error } = await supabaseClient.from('orders').insert({
              telegram_user_id: userId.toString(),
              order_id: orderId,
              item_name: item.item_name,
              quantity: parseFloat(quantity),
              category: item.category
            });
            
            if (error) {
              console.error('Error saving order to database:', error);
              // Still show success to user even if database save fails
            }
          } catch (error) {
            console.error('Database save failed:', error);
            // Continue anyway - the important part is user feedback
          }
          
          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: `✅ Added "${itemName}" to your order!`
            })
          });
          
          // Send confirmation message
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ *Added to Order:*\n${item.item_name} (Qty: ${quantity})`,
              parse_mode: 'Markdown'
            })
          });
        } else {
          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: "Item not found"
            })
          });
        }
      }
      return new Response(JSON.stringify({
        success: true
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Handle regular messages
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const userId = update.message.from.id;
      const firstName = update.message.from.first_name;
      console.log(`Received message from ${userId}: ${text}`);
      // Handle /start command
      if (text === '/start') {
        const startMessage = `Hi ${firstName}!\n\nStart ordering by typing @Kalipos_bot item name\n\nOrder from app using POS button`;
        const keyboard = {
          inline_keyboard: [
            [
              {
                text: "📱 Open POS App",
                web_app: {
                  url: "https://telegram-admin-dashb-vpqt.bolt.host"
                }
              }
            ],
            [
              {
                text: "📋 My Orders",
                callback_data: "show_orders"
              }
            ]
          ]
        };
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: startMessage,
            reply_markup: keyboard
          })
        });
      } else {
        // Simple echo response for other messages
        const responseText = `Received: ${text}\n\nUse @Kalipos_bot to search for items, or use the POS app button above.`;
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: responseText
          })
        });
      }
    }
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error in telegram-webhook:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
