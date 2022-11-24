// Récupérer l'id produit disponibles depuis API

const id = new URLSearchParams(window.location.search).get("id");

// Récupérer la page produit

fetch("http://localhost:3000/api/products/" + id)
	.then((reponse) => {
		if (reponse.ok) return reponse.json();
	})

	// Insérer les infos

	.then((product) => {
		document.getElementsByClassName(
			"item__img"
		)[0].innerHTML = `<img src="${product.imageUrl}" alt="${product.altText}"></img>`;

		document.getElementById(
			"title"
		).innerHTML = `<h1 id="title">${product.name}</h1>`;

		document.getElementById(
			"price"
		).innerHTML = `<span id="price">${product.price}</span>`;

		document.getElementById(
			"description"
		).innerHTML = `<p id="description">${product.description}</p>`;

		// pour chaque couleur forEach Creer l'option de valeur

		const couleursElements = document.getElementById("colors");

		// afficher le menu des couleurs
		product.colors.forEach(afficher);
		function afficher(couleur) {
			const elementOption = document.createElement("option");
			elementOption.setAttribute("value", couleur);
			elementOption.textContent = couleur;
			couleursElements.appendChild(elementOption);
		}

		// créer l'objet d'un article
		let btnAddToCart = document.getElementById("addToCart");
		btnAddToCart.addEventListener("click", function () {
			const produitSelectionner = {
				id: id,
				couleur: couleursElements.value,
				quantity: parseInt(document.getElementById("quantity").value),
			};

			if (produitSelectionner.quantity <= 0) {
				alert("quantite invalide");
				return;
			}

			if (!produitSelectionner.couleur) {
				alert("couleur invalide");
				return;
			}

			let panier = [];
			let panierInitiale = JSON.parse(localStorage.getItem("panier"));

			// verifier si l'id de l'article selectionner est deja dans le panier
			if (panierInitiale != null) panier = panier.concat(panierInitiale);

			let position = panier.findIndex((item) => {
				return (
					item != null &&
					item.id == id &&
					item.couleur == produitSelectionner.couleur
				);
			});
			// envoyer l'article dans le localstorage
			if (position == -1) {
				panier.push(produitSelectionner);
			} else {
				panier[position].quantity += produitSelectionner.quantity;
			}
			localStorage.setItem("panier", JSON.stringify(panier));
			alert("produit ajouté au panier!");
		});
	});
