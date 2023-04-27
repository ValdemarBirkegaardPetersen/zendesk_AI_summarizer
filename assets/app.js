function entryPoint() {
  var client = ZAFClient.init();
  client.invoke('resize', {
    width: '100%',
    height: '600px'
  });

  client.on('app.registered', () => {
    loadTicketConversation(client);
  });
}


function loadTicketConversation(zafClint) {
  const ticketContent = document.getElementById('ticket-content');
  zafClint.get('ticket').then((ticket) => {
    const ticketComments = ticket.ticket.comments;

    var allComments = ""
    var messageCounter = ticketComments.length;

    ticketComments.forEach((comment) => {
      allComments += "Message author: " + comment.author.name + " (" + comment.author.role + ")<br>" + "Message " + messageCounter + ": " + comment.value.replace(/(<([^>]+)>)/gi, "") + "<br><br>";

      messageCounter -= 1
    });

    let prompt = createPrompt(allComments);
    callChatGPTAPI(prompt);
  });
}

function createPrompt(conversation) {
  var prompt = "Please provide a concise and accurate summary of the following ticket conversation, ensuring that key points and resolutions are highlighted. Remember to specific about the issue mentoined, including the technologies, bugs involved. " + "<b>Tickcet Conversation Below: <br>" + conversation;
  return prompt;
}


async function callChatGPTAPI(promptStr) {
  const ticketContent = document.getElementById('ticket-content');
  const api_key = "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";
  const apiURL = 'https://api.openai.com/v1/chat/completions';
  ticketContent.innerHTML = "Loading";

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${api_key}`,
  };

  const body = JSON.stringify({
    "model": "gpt-3.5-turbo",
    "stream": true,
    "messages": [{ "role": "user", "content": promptStr }]
  });

  try {
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    let stringerz = ""
     
    if (response.ok) {
      const responseStream = await response;
      //const generatedText = jsonResponse.choices[0].message.content;
      const reader = responseStream.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        
        let chunk = decoder.decode(value, { stream: true });
        let tryChunk = chunk.replace(/data: /g, '');

        let jsonArray = parseJsonStream(tryChunk);        

        jsonArray.forEach((json) => {
          try {
              if (json.choices[0].delta.content == "undefined" || json.choices[0].delta.content == null ||json.choices[0].delta.content == undefined) {
                stringerz += "";
              } else {
                stringerz += json.choices[0].delta.content;
              }
          } catch (e) {
              stringerz += "";
          }
        });
        
        result += stringerz;
        ticketContent.innerHTML = stringerz;
      }
      return result;
    } else {
      ticketContent.innerHTML = response.status;
      return null;
    }
  } catch (error) {
    ticketContent.innerHTML = error;
    return null;
  }


}

function parseJsonStream(stream) {
  const ticketContent = document.getElementById('ticket-content');
  const results = [];
  stream.split('\n').forEach((line) => {
    if (line.trim()) {
      try {
      results.push(JSON.parse(line));
      } catch (e) {
        console.log("Error: " + e);
      }
    }
  });
  return results;
}