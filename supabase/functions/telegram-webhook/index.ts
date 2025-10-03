import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }

    const update = await req.json();

    if (update.inline_query) {
      const query = update.inline_query.query;
      let results: any[] = [];

      if (query.startsWith("cat ")) {
        const catQuery = query.substring(4).trim();

        if (catQuery === "") {
          const categories = [
            "cleaning",
            "box",
            "ustensil",
            "plastic bag",
            "kitchen roll",
            "cheese",
          ];
          results = categories.map((category, index) => ({
            type: "article",
            id: `category_${index + 1}`,
            title: `${index + 1}. ${category.charAt(0).toUpperCase() + category.slice(1)}`,
            description: `Type "${index + 1}" to see ${category} items`,
            input_message_content: {
              message_text: `Category: ${category}`,
              parse_mode: "Markdown",
            },
          }));
        } else if (/^\d+$/.test(catQuery)) {
          const categoryNum = parseInt(catQuery);
          const categories = [
            "cleaning",
            "box",
            "ustensil",
            "plastic bag",
            "kitchen roll",
            "cheese",
          ];

          if (categoryNum >= 1 && categoryNum <= categories.length) {
            const selectedCategory = categories[categoryNum - 1];

            const { data: categoryItems, error: categoryError } =
              await supabaseClient
                .from("items")
                .select("item_name, category, default_supplier")
                .ilike("category", `%${selectedCategory}%`)
                .limit(50);

            if (!categoryError && categoryItems) {
              results = categoryItems.map((item, index) => ({
                type: "article",
                id: `item_${categoryNum}_${index}`,
                title: item.item_name,
                description: `${item.category} - ${item.default_supplier}`,
                input_message_content: {
                  message_text: `Selected: ${item.item_name}`,
                  parse_mode: "Markdown",
                },
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "1",
                        callback_data: `add_item:${item.item_name}:1`,
                      },
                      {
                        text: "2",
                        callback_data: `add_item:${item.item_name}:2`,
                      },
                      {
                        text: "3",
                        callback_data: `add_item:${item.item_name}:3`,
                      },
                    ],
                    [
                      {
                        text: "5",
                        callback_data: `add_item:${item.item_name}:5`,
                      },
                      {
                        text: "10",
                        callback_data: `add_item:${item.item_name}:10`,
                      },
                      {
                        text: "Custom",
                        callback_data: `custom_qty:${item.item_name}`,
                      },
                    ],
                  ],
                },
              }));
            }
          }
        }
      } else if (query === "") {
        const { data: allItems, error: allItemsError } = await supabaseClient
          .from("items")
          .select("item_name, category, default_supplier")
          .order("item_name")
          .limit(50);

        if (!allItemsError && allItems) {
          results = allItems.map((item, index) => ({
            type: "article",
            id: `all_item_${index}`,
            title: item.item_name,
            description: `${item.category} - ${item.default_supplier}`,
            input_message_content: {
              message_text: `Selected: ${item.item_name}`,
              parse_mode: "Markdown",
            },
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "1", callback_data: `add_item:${item.item_name}:1` },
                  { text: "2", callback_data: `add_item:${item.item_name}:2` },
                  { text: "3", callback_data: `add_item:${item.item_name}:3` },
                ],
                [
                  { text: "5", callback_data: `add_item:${item.item_name}:5` },
                  {
                    text: "10",
                    callback_data: `add_item:${item.item_name}:10`,
                  },
                  {
                    text: "Custom",
                    callback_data: `custom_qty:${item.item_name}`,
                  },
                ],
              ],
            },
          }));
        }
      } else {
        const { data: searchItems, error: searchError } = await supabaseClient
          .from("items")
          .select("item_name, category, default_supplier")
          .or(`item_name.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(50);

        if (!searchError && searchItems) {
          results = searchItems.map((item, index) => ({
            type: "article",
            id: `search_${index}`,
            title: item.item_name,
            description: `${item.category} - ${item.default_supplier}`,
            input_message_content: {
              message_text: `Selected: ${item.item_name}`,
              parse_mode: "Markdown",
            },
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "1", callback_data: `add_item:${item.item_name}:1` },
                  { text: "2", callback_data: `add_item:${item.item_name}:2` },
                  { text: "3", callback_data: `add_item:${item.item_name}:3` },
                ],
                [
                  { text: "5", callback_data: `add_item:${item.item_name}:5` },
                  {
                    text: "10",
                    callback_data: `add_item:${item.item_name}:10`,
                  },
                  {
                    text: "Custom",
                    callback_data: `custom_qty:${item.item_name}`,
                  },
                ],
              ],
            },
          }));
        }
      }

      const inlineResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/answerInlineQuery`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inline_query_id: update.inline_query.id,
            results: results,
            cache_time: 300,
          }),
        }
      );

      if (!inlineResponse.ok) {
        console.error(
          "Failed to answer inline query:",
          await inlineResponse.text()
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      });
    }

    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const userId = update.callback_query.from.id;
      const chatId = update.callback_query.message?.chat.id;

      if (callbackData === "show_orders") {
        const { data: orders, error } = await supabaseClient
          .from("orders")
          .select(`
            id,
            order_number,
            created_at,
            status
          `)
          .eq("telegram_user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching orders:", error);
          await fetch(
            `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                callback_query_id: update.callback_query.id,
                text: "Error fetching orders",
              }),
            }
          );
          return new Response(JSON.stringify({ success: false }), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 200,
          });
        }

        let orderMessage = "=� *Your Recent Orders:*\n\n";
        if (!orders || orders.length === 0) {
          orderMessage +=
            "No orders found. Start ordering using the POS app!";
        } else {
          for (const [index, order] of orders.entries()) {
            const { data: orderItems } = await supabaseClient
              .from("order_items")
              .select("item_name, quantity")
              .eq("order_id", order.id);

            const orderDate = new Date(order.created_at).toLocaleDateString();
            orderMessage += `*${order.order_number}* (${orderDate})\n`;
            orderMessage += `Status: ${order.status}\n`;

            if (orderItems && orderItems.length > 0) {
              orderItems.forEach((item) => {
                orderMessage += `" ${item.item_name}: ${item.quantity}\n`;
              });
            }
            orderMessage += "\n";
          }
        }

        await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: orderMessage,
              parse_mode: "Markdown",
            }),
          }
        );

        await fetch(
          `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: "Orders displayed",
            }),
          }
        );
      } else if (callbackData.startsWith("add_item:")) {
        const [, itemName, quantity] = callbackData.split(":");

        const { data: item, error: itemError } = await supabaseClient
          .from("items")
          .select("item_name, category, default_supplier")
          .eq("item_name", itemName)
          .maybeSingle();

        if (itemError || !item) {
          await fetch(
            `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                callback_query_id: update.callback_query.id,
                text: "Item not found",
              }),
            }
          );
          return new Response(JSON.stringify({ success: false }), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 200,
          });
        }

        const timestamp = Date.now();
        const orderNumber = `TG-${timestamp}`;

        const { data: orderData, error: orderError } = await supabaseClient
          .from("orders")
          .insert({
            order_number: orderNumber,
            telegram_user_id: userId,
            status: "New",
            team_tags: [],
          })
          .select()
          .single();

        if (orderError) {
          console.error("Error creating order:", orderError);
          await fetch(
            `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                callback_query_id: update.callback_query.id,
                text: "Error saving order",
              }),
            }
          );
          return new Response(JSON.stringify({ success: false }), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 200,
          });
        }

        const { error: itemInsertError } = await supabaseClient
          .from("order_items")
          .insert({
            order_id: orderData.id,
            item_name: item.item_name,
            quantity: parseFloat(quantity),
            category: item.category,
            is_available: true,
            is_confirmed: false,
          });

        if (itemInsertError) {
          console.error("Error adding item to order:", itemInsertError);
        }

        await fetch(
          `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: ` Added "${itemName}" to your order!`,
            }),
          }
        );

        await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: ` *Order Created:*\n${orderNumber}\n\n${item.item_name} (Qty: ${quantity})`,
              parse_mode: "Markdown",
            }),
          }
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      });
    }

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const userId = update.message.from.id;
      const firstName = update.message.from.first_name;

      console.log(`Received message from ${userId}: ${text}`);

      if (text === "/start") {
        const startMessage = `Hi ${firstName}!\n\nStart ordering by typing @Kalipos_bot item name\n\nOrder from app using POS button`;
        const keyboard = {
          inline_keyboard: [
            [
              {
                text: "=� Open POS App",
                web_app: {
                  url: "https://telegram-admin-dashb-vpqt.bolt.host",
                },
              },
            ],
            [
              {
                text: "=� My Orders",
                callback_data: "show_orders",
              },
            ],
          ],
        };

        await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: startMessage,
              reply_markup: keyboard,
            }),
          }
        );
      } else {
        const responseText = `Received: ${text}\n\nUse @Kalipos_bot to search for items, or use the POS app button above.`;
        await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: responseText,
            }),
          }
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error in telegram-webhook:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
