export class NftCard {
  show(container, data, onClick) {
    const card = document.createElement("div");
    card.className = "nft";

    card.innerHTML = `
      <div class='mainsection'>
        <img class='tokenImage' src="${data.image}" alt="NFT" />
        <h2>${data.title}</h2>
        <p class='description'>${data.description}</p>
        <div class='tokenInfo'>
          <div class="price">
            <ins>◘</ins>
            <p>${data.price}</p>
          </div>
          <div class="duration">
            <ins>◷</ins>
            <p>${data.duration}</p>
          </div>
        </div>
        <hr />
        <div class='creator'>
          <div class='wrappers'>
            <img src="${data.creatorImage}" alt="Creator" />
          </div>
          <p><ins>Creation of</ins> ${data.creatorName}</p>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      onClick?.(data, card);
    });

    container.appendChild(card);
    return card;
  }
}
