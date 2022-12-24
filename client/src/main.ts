import bot from "../assets/bot.svg";
import user from "../assets/user.svg";

const form = document.querySelector("form") as HTMLFormElement;
const chatContainer = document.querySelector(
  "#chat_container"
) as HTMLDivElement;
let loadInterval: number;

//Load Ai Answer (reasoning display)
function loader(element: HTMLElement): void {
  element.textContent = "";

  //Show . every 300ms
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

//Type text
function typeText(element: HTMLElement, text: string): void {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

//Generate a unique id for every single message
function generateUniqueId(): string {
  const timestamp = Date.now();
  const randomNumber = Math.random();

  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

//Message stripe
function chatStripe(isAi: boolean, value: any, uniqueId?: string): string {
  return `
  <div class="wrapper ${isAi && "ai"}">
    <div class="chat">
      <div class="profile">
        <img 
          src="${isAi ? bot : user}" 
          alt="${isAi ? "bot" : "user"}"
          />
      </div>
      <div class="message" id=${uniqueId}>${value}</div>
    </div>
  </div>
  `;
}

async function handleSubmit(e: Event): Promise<any> {
  e.preventDefault();

  const data = new FormData(form);
  //User's char stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  //Reset form state
  form.reset();

  //bot's chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  //Keep scroll as long as the message
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId) as HTMLDivElement;
  loader(messageDiv);

  //Fetch data from server
  const response: Response = await fetch("https://third-hand.onrender.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const result = await response.json();
    const parsedResult = result.bot.trim();

    typeText(messageDiv, parsedResult);
  } else {
    const err = await response.json();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
}
form.addEventListener("submit", handleSubmit);
//On enter pressed
form.addEventListener("keyup", (e: KeyboardEvent) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
