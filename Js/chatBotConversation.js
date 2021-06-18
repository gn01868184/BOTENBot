const rasaUrl = "http://localhost:5005/webhooks/rest/webhook"

// Selecting element to view chat
var chatBotSession = document.querySelector(".chatBot .chatBody .chatSession")

// Selecting trigger elements of conversation
var chatBotSendButton = document.querySelector(".chatBot .chatForm #sendButton")
var chatBotTextArea = document.querySelector(".chatBot .chatForm #chatTextBox")
var chatBotAllowLocation = document.querySelector("#allowLocation")
// Default values for replies
var chatBotInitiateMessage = "Hello! I am ChatBot."
var chatBotBlankMessageReply = "Type something!"
var chatBotReply = "{{ reply }}"

// Collecting user input
var inputMessage = ""

// This helps generate text containers in the chat
var typeOfContainer = ""

// Function to open ChatBot
chatBotSendButton.addEventListener("click", (event) => {
  // Since the button is a submit button, the form gets submittd and the complete webpage reloads. This prevents the page from reloading. We would submit the message later manually
  event.preventDefault()
  if (validateMessage()) {
    inputMessage = chatBotTextArea.value
    typeOfContainer = "message"
    createContainer(typeOfContainer)
    setTimeout(function() {
      typeOfContainer = "reply"
      createContainer(typeOfContainer)
    }, 750);
  } else {
    typeOfContainer = "error";
    createContainer(typeOfContainer)
  }
  chatBotTextArea.value = ""
  chatBotTextArea.focus()
})

chatBotAllowLocation.addEventListener("click", (event) => {
  // Since the button is a submit button, the form gets submittd and the complete webpage reloads. This prevents the page from reloading. We would submit the message later manually
  event.preventDefault()

  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  function success(pos) {
    var crd = pos.coords;

    console.log('Your current position is:');
    console.log('Latitude : ' + crd.latitude);
    console.log('Longitude: ' + crd.longitude);
    inputMessage = "Latitude of my current location is " + crd.latitude + ", longitude of my current location is " + crd.longitude;
    typeOfContainer = "message"
    createContainer(typeOfContainer)
    setTimeout(function() {
      typeOfContainer = "reply"
      createContainer(typeOfContainer)
    }, 750);
  };

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  };
  navigator.geolocation.getCurrentPosition(success, error, options);

  chatBotTextArea.value = ""
  chatBotTextArea.focus()
})

function createContainer(typeOfContainer) {
  var containerID = ""
  var textClass = ""
  switch (typeOfContainer) {
    case "message":
      // This would create a message container for user's message
      containerID = "messageContainer"
      textClass = "message"
      break;
    case "reply":
    case "initialize":
    case "error":
      // This would create a reply container for bot's reply
      containerID = "replyContainer"
      textClass = "reply"
      break;
    default:
      alert("Error! Please reload the webiste.")
  }

  // Creating container
  var newContainer = document.createElement("div")
  newContainer.setAttribute("class", "container")
  if (containerID == "messageContainer")
    newContainer.setAttribute("id", "messageContainer")
  if (containerID == "replyContainer")
    newContainer.setAttribute("id", "replyContainer")
  chatBotSession.appendChild(newContainer)

  switch (textClass) {
    case "message":
      var allMessageContainers = document.querySelectorAll("#messageContainer")
      var lastMessageContainer = allMessageContainers[allMessageContainers.length - 1]
      var newMessage = document.createElement("p")
      newMessage.setAttribute("class", "message animateChat")
      newMessage.innerHTML = inputMessage
      lastMessageContainer.appendChild(newMessage)
      lastMessageContainer.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      })
      break
    case "reply":
      var allReplyContainers = document.querySelectorAll("#replyContainer")
      var lastReplyContainer = allReplyContainers[allReplyContainers.length - 1]
      var newReply = document.createElement("p")
      newReply.setAttribute("class", "reply animateChat accentColor")
      switch (typeOfContainer) {
        case "reply":
          chatBotReply = ajaxFunction(inputMessage);
          newReply.innerHTML = chatBotReply
          break
        case "initialize":
          newReply.innerHTML = chatBotInitiateMessage
          break
        case "error":
          newReply.innerHTML = chatBotBlankMessageReply
          break
        default:
          newReply.innerHTML = "Sorry! I could not understannd."
      }
      setTimeout(function() {
        lastReplyContainer.appendChild(newReply)
        lastReplyContainer.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest"
        })
      }, 10)
      break
    default:
      console.log("Error in conversation")
  }
}

function initiateConversation() {
  chatBotSession.innerHTML = ""
  typeOfContainer = "initialize"
  createContainer(typeOfContainer)
}

function ajaxFunction(userInput) {
  var response;
  if (localStorage.getItem('userName') != null) {
    var reqData = {
      "sender": localStorage.getItem('userName'),
      "message": userInput
    }
    console.log(reqData);
    $.ajax({
      async: false,
      type: "POST",
      url: rasaUrl,
      dataType: 'json',
      data: JSON.stringify(reqData),
      success: function(data) {
        console.log(data);
        data.forEach(function(value, index, array) {
          let idList = Object.keys(data[index]);
          idList.forEach(function(dataValue) {
            if (dataValue == 'text') {
              var output = data[index]['text'];
              // json beautify
              if (isJsonString(output) == true) {
                var tmpData = JSON.parse(data[index]['text']);
                console.log(tmpData);
                if (tmpData['message'] == null) {
                  var random = getRandomInt(10000);
                  $('#reponse').append('<div id=' + random + '><table class="table table-striped"><thead class="thead-dark"></thead><tbody></tbody></table></div>');
                  $(tmpData['thead']).each(function(k, v) {
                    $('#' + random + ' table thead').append(
                      '<th scope="col">' + v + '</th>'
                    );
                  });
                  $(tmpData['tbody']).each(function() {
                    $(this).each(function(k, v) {
                      $('#' + random + ' table tbody').append('<tr></tr>');
                      $('#' + random + ' table tbody tr:nth-child(' + (k + 1) + ')').append(
                        '<th scope="col">' + v + '</th>'
                      );
                    });
                  });
                  response = "Please see the table";
                } else {
                  response = tmpData['message'];
                }
              } else {
                response = output;
              }
            }
          });
        });
      }
    });
    return response;
  } else {
    alert("Please enter your username");
  }
}

//is json?
function isJsonString(str) {
  try {
    if (typeof JSON.parse(str) == "object") {
      return true;
    }
  } catch (e) {}
  return false;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
