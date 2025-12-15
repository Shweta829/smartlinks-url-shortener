function shorten() {
 const url = document.getElementById("url").value;
 fetch("/shorten", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({url: url})
 })
 .then(res => res.json())
 .then(data => {
  document.getElementById("result").innerHTML =
   `<a href="${data.short_url}" target="_blank">${data.short_url}</a>
    <br><br><a href="/dashboard/${data.code}">View Analytics</a>`;
 });
}