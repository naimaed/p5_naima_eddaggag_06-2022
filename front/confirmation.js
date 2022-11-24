// recuperer l'url 'dun article
const orderId = new URLSearchParams(window.location.search).get("orderId");

// afficher le message et numéro de commande générer par l'Api
document.getElementById("orderId").innerText = orderId;
