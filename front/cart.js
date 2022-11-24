// recuperer le panier depuis le local storage
function getPanier() {
	panier = JSON.parse(localStorage.getItem("panier"));
}
// definir le panier
let panier = [];
getPanier();
// pour chaque produit
try {
	panier.forEach((article) => {
		showDetails(article);
	});
} catch (exception) {
	alert("panier vide");
}

// recuperer l'identifiant la couleur du produit
async function showDetails(produit) {
	let produitElement = document.createElement("article");
	produitElement.classList.add("cart__item");
	produitElement.setAttribute("data-id", produit.id);
	produitElement.setAttribute("data-color", produit.couleur);

	let produitInfo = await getProduit(produit.id);

	//afficher les details produits dans le dom
	let imageElement = document.createElement("div");
	imageElement.classList.add("cart__item__img");
	imageElement.innerHTML = `<img src="${produitInfo.imageUrl}" alt="${produitInfo.atlTxt}" />`;
	produitElement.appendChild(imageElement);

	let contentElement = document.createElement("div");
	contentElement.classList.add("cart__item__content");
	contentElement.innerHTML = `<div class="cart__item__content__description">
	<h2>${produitInfo.name}</h2>
	<p>${produit.couleur}</p>
	<p>${produitInfo.price}</p>
</div>`;
	produitElement.appendChild(contentElement);

	let settingsElement = document.createElement("div");
	settingsElement.classList.add("cart__item__content__settings");
	settingsElement.innerHTML = `
	<div class="cart__item__content__settings__quantity">
	<p>Qté :</p>
	<input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${produit.quantity}"/>
	</div>

	<div class="cart__item__content__settings__delete">
		<p class="deleteItem">Supprimer</p>
	</div>`;
	produitElement.appendChild(settingsElement);

	document.getElementById("cart__items").appendChild(produitElement);

	supprimerProduit();
	modifierProduit();
	calculerTotal();
}

// recuperer les information des produits depuis l'Api
function getProduit(produitId) {
	return fetch("http://localhost:3000/api/products/" + produitId)
		.then((reponse) => {
			if (reponse.ok) return reponse.json();
		})
		.then((reponseJSON) => {
			return reponseJSON;
		});
}

// pour pouvoir supprimer l'article du panier et ajuster le prix
function supprimerProduit() {
	const supprimerArticles = document.getElementsByClassName("deleteItem");

	for (let i = 0; i < supprimerArticles.length; i++) {
		let btnSupprimerArticle = supprimerArticles[i];
		btnSupprimerArticle.addEventListener("click", function (event) {
			let btnSupprimer = event.target;
			panier.splice(i, 1);
			localStorage.setItem("panier", JSON.stringify(panier));
			btnSupprimer.closest("article").remove();

			calculerTotal();
		});
	}
}

// pour pouvoir modifier la quantite d'un produit et ajuster le prix
function modifierProduit() {
	const quantiteArticle = document.getElementsByClassName("itemQuantity");

	for (let i = 0; i < quantiteArticle.length; i++) {
		let input = quantiteArticle[i];
		input.addEventListener("change", function (event) {
			let btnUpdateQuantite = event.target;
			if (isNaN(btnUpdateQuantite.value) || btnUpdateQuantite.value <= 0) {
				btnUpdateQuantite.value = 1;
			}
			panier[i].quantity = btnUpdateQuantite.value;
			localStorage.setItem("panier", JSON.stringify(panier));
			calculerTotal();
		});
	}
}
// pour calculer le prix total de la commande
function calculerTotal() {
	let totalPrice = 0;
	let totalQuantite = 0;
	let quantiteTotalElt = document.getElementById("totalQuantity");
	let prixTotalElt = document.getElementById("totalPrice");
	let articleElts = document.getElementsByTagName("article");

	if (!articleElts.length) {
		quantiteTotalElt.innerText = 0;
		prixTotalElt.innerText = 0;
	}
	for (let i = 0; i < articleElts.length; i++) {
		let prixElmt = articleElts[i].querySelector(
			".cart__item__content__description :nth-child(3)"
		);

		let quantiteElmt = articleElts[i].querySelector(".itemQuantity");
		totalQuantite += parseInt(quantiteElmt.value);
		totalPrice += parseInt(prixElmt.textContent) * parseInt(quantiteElmt.value);
		quantiteTotalElt.innerText = totalQuantite;
		prixTotalElt.innerText = totalPrice;
	}
}
// pour regler les champs du formaulaire
let firstName = document.getElementById("firstName");
let lastName = document.getElementById("lastName");
let adress = document.getElementById("address");
let city = document.getElementById("city");
let email = document.getElementById("email");

const regexName = /^[a-zA-Z]+([a-zA-Z])/;
const regexAdress = /^[a-zA-Z0-9]+/;
const regexEmail =
	/^[a-zA-Z0-9]+(\.)*[a-zA-Z0-9]*@([a-zA-Z]){2,}(\.[a-zA-Z]{2,})$/;

firstName.addEventListener("change", (event) => {
	event.preventDefault();
	checkValidity(firstName, regexName);
});
lastName.addEventListener("change", (event) => {
	event.preventDefault();
	checkValidity(lastName, regexName);
});
adress.addEventListener("change", (event) => {
	event.preventDefault();
	checkValidity(adress, regexAdress);
});
city.addEventListener("change", (event) => {
	event.preventDefault();
	checkValidity(city, regexName);
});
email.addEventListener("change", (event) => {
	event.preventDefault();
	checkValidity(email, regexEmail);
});

function checkValidity(input, regex) {
	if (!regex.test(input.value)) {
		document.getElementById(input.name + "ErrorMsg").innerText =
			input.name + " non valide!";
	} else {
		document.getElementById(input.name + "ErrorMsg").innerText = "";
	}
}

// pour passer la commande
document.getElementById("order").addEventListener("click", (event) => {
	event.preventDefault();
	commander();
});

function commander() {
	if (
		isBlank(firstName.value) ||
		isBlank(lastName.value) ||
		isBlank(adress.value) ||
		isBlank(adress.value) ||
		isBlank(city.value) ||
		isBlank(email.value)
	) {
		alert("veuillez remplir le formulaire de contact");
		return;
	}

	const contact = {
		firstName: firstName.value,
		lastName: lastName.value,
		address: adress.value,
		city: city.value,
		email: email.value,
	};

	if (!panier || !panier.length) {
		alert("veuillez ajouter un produit dans le panier");
		return;
	}

	let products = [];

	for (let i = 0; i < panier.length; i++) {
		products.push(panier[i].id);
	}

	const order = { contact: contact, products: products };

	// pour envoyer la commande a l'Api et recevoir en retour le confirmation
	fetch("http://localhost:3000/api/products/order", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(order),
	})
		.then((response) => {
			return response.json();
		})
		.then((response) => {
			document.location.href = "confirmation.html?orderId=" + response.orderId;
			localStorage.clear();
		})

		.catch((err) => {
			alert("commande non valide");
		});
}

function isBlank(input) {
	return !input || !input.trim().length;
}
