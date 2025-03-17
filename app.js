let cryptoZombies, userAccount;
const cryptoZombiesAddress = "0xef42b77851EaFd156d235585706cF017e2B91921";

const clickSound = new Audio("./sound/click.mp3");
const keyPressSound = new Audio("./sound/keypress.mp3");
const cheerSound = new Audio("./sound/cheer.mp3");
const suspenseSound = new Audio("./sound/suspense.wav");
const windSound = new Audio("./sound/wind.mp3");

function playKeyPressSound() {
  keyPressSound.currentTime = 0;
  keyPressSound.volume = 0.5;
  keyPressSound.play();
}

function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.volume = 1;
  clickSound.play();
}

function playCheerSound() {
  cheerSound.currentTime = 0;
  cheerSound.volume = 1;
  cheerSound.play();
  setTimeout(() => {
    cheerSound.pause();
    cheerSound.currentTime = 0;
  }, 2000);
}

function playWindSound() {
  windSound.currentTime = 0;
  windSound.volume = 1;
  windSound.play();
  setTimeout(() => {
    windSound.pause();
    windSound.currentTime = 0;
  }, 1000);
}


window.addEventListener('load', async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    userAccount = accounts[0];
    cryptoZombies = new web3.eth.Contract(cryptoZombiesABI, cryptoZombiesAddress);
    displayStatus("Connected as: " + userAccount);
  } else {
    alert("Please install MetaMask!");
  }
  document.addEventListener("keydown", playKeyPressSound);
  document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", playClickSound);
  });
  document.getElementById('createzombieButton').removeEventListener('click', createZombie);
  document.getElementById('createzombieButton').addEventListener('click', createZombie);
  document.getElementById('showZombieButton').removeEventListener('click', showZombies);
  document.getElementById('showZombieButton').addEventListener('click', showZombies);
  document.getElementById('attackBtn').removeEventListener('click', attackZombie);
  document.getElementById('attackBtn').addEventListener('click', attackZombie);
  document.getElementById('hideZombieButton').onclick = hideZombies;
});

function displayStatus(msg) {
  document.getElementById("txStatus").innerText = msg;
}

async function createZombie() {
  let name = document.getElementById('zombieName').value.trim();
  if (!name) {
    alert("Enter zombie name!");
    return;
  }

  displayStatus("Creating zombie...");
  await cryptoZombies.methods.createRandomZombie(name).send({ from: userAccount })
    .on('receipt', async (receipt) => {
      playWindSound();
      displayStatus("Zombie created successfully!");
      const zombieId = receipt.events.NewZombie.returnValues.zombieId;
      const zombie = await cryptoZombies.methods.zombies(zombieId).call();

      const zombieCard = document.createElement("div");
      zombieCard.className = "zombie fade-in";
      zombieCard.id = `zombie-${zombieId}`;
      zombieCard.innerHTML = `
        <h3>${getZombieEmoji(zombie.dna)} ${zombie.name}</h3>
        <ul>
          <li><b>ID:</b> ${zombieId}</li>
          <li><b>DNA:</b> ${zombie.dna}</li>
          <li><b>Level:</b> ${zombie.level}</li>
          <li><b>Wins:</b> ${zombie.winCount}</li>
          <li><b>Losses:</b> ${zombie.lossCount}</li>
        </ul>
        <button onclick="levelUpZombie(${zombieId})">🚀 Level Up</button>
      `;
      document.getElementById("zombieArmy").appendChild(zombieCard);
    }).on('error', (err) => displayStatus(err.message));
}

async function showZombies() {
  const zombieArmy = document.getElementById("zombieArmy");
  zombieArmy.innerHTML = "";
  displayStatus("Loading your zombies...");

  const ids = await cryptoZombies.methods.getZombiesByOwner(userAccount).call();
  let zombies = [];

  for (let id of ids) {
    let zombie = await cryptoZombies.methods.zombies(id).call();
    zombie.id = id;
    zombies.push(zombie);
  }

  zombies.sort((a, b) => b.level - a.level);

  for (let zombie of zombies) {
    zombieArmy.innerHTML += `
      <div class="zombie" id="zombie-${zombie.id}" style="position:relative;">
        <div class="fire-badge">Lv.${zombie.level}</div>
        <h3>${getZombieEmoji(zombie.dna)} ${zombie.name}</h3>
        <ul>
          <li><b>ID:</b> ${zombie.id}</li>
          <li><b>DNA:</b> ${zombie.dna}</li>
          <li><b>Level:</b> ${zombie.level}</li>
          <li><b>Wins:</b> ${zombie.winCount}</li>
          <li><b>Losses:</b> ${zombie.lossCount}</li>
          <li><b>Ready:</b> ${new Date(zombie.readyTime * 1000).toLocaleString()}</li>
        </ul>
        <div class="fire-badge">Lv.${zombie.level}</div>
        <button onclick="levelUpZombie(${zombie.id})">🚀 Level Up</button>
      </div>`;
  }
  displayStatus("");
}

async function levelUpZombie(zombieId) {
  displayStatus(`🔥 Leveling up Zombie ID: ${zombieId}...`);

  await cryptoZombies.methods.levelUp(zombieId)
    .send({ from: userAccount, value: web3.utils.toWei("0.001", "ether") })
    .on('receipt', () => {
      const fireEffect = document.createElement("div");

      setTimeout(() => {
        const blastSound = new Audio("./sound/sound.mp3");
        blastSound.volume = 1;
        blastSound.play();
      }, 500);
      fireEffect.classList.add("fire-overlay");
      fireEffect.innerHTML = "🔥 LEVEL UP 🔥";
      document.body.appendChild(fireEffect);
      displayStatus(`🚀 Zombie ID ${zombieId} leveled up successfully!`);


      document.querySelector(`#zombie-${zombieId} button`).classList.add("rocket-zoom");

      setTimeout(() => {
        fireEffect.remove();
        showZombies();
      }, 3000);
    })
    .on('error', (err) => {
      fireEffect.remove();
      displayStatus(err.message);
    });
}

displayStatus("Leveling up your first zombie...");
cryptoZombies.methods.levelUp(ids[0])
  .send({ from: userAccount, value: web3.utils.toWei("0.001", "ether") })
  .on('receipt', function () {
    displayStatus("Zombie leveled up successfully!");
    showZombies();
  })
  .on('error', (err) => displayStatus(err.message));

async function attackZombie() {
  suspenseSound.currentTime = 0;
  suspenseSound.volume = 1;
  suspenseSound.play();
  const attackerZombieId = document.getElementById("attackerZombieId").value.trim();
  const targetZombieId = document.getElementById("targetZombieId").value.trim();

  if (!attackerZombieId || !targetZombieId) {
    alert("Clearly specify both Zombie IDs!");
    return;
  }

  displayStatus(`Zombie ${attackerZombieId} attacking Zombie ${targetZombieId}...`);

  const attackerBefore = await cryptoZombies.methods.zombies(attackerZombieId).call();
  const defenderBefore = await cryptoZombies.methods.zombies(targetZombieId).call();

  document.getElementById('zombieArmy').innerHTML = `
      <div class="battle-container">
        <div class="zombie attacker">
          <h3>${getZombieEmoji(attackerBefore.dna)} ${attackerBefore.name}</h3>
          <b>ID:</b> ${attackerZombieId}<br>
          Level: ${attackerBefore.level}
        </div>
        <div class="vs">⚔️ VS ⚔️</div>
        <div class="zombie defender">
          <h3>${getZombieEmoji(defenderBefore.dna)}  ${defenderBefore.name}</h3>
          <b>ID:</b> ${targetZombieId}<br>
          Level: ${defenderBefore.level}
        </div>
      </div>
    `;

  await cryptoZombies.methods.attack(attackerZombieId, targetZombieId)
    .send({ from: userAccount, gas: 3000000 })
    .on('receipt', async () => {
      displayStatus("Attack transaction successful! Determining winner...");

      const attackerAfter = await cryptoZombies.methods.zombies(attackerZombieId).call();
      const defenderAfter = await cryptoZombies.methods.zombies(targetZombieId).call();

      let winnerId, winnerZombie;

      if (
        parseInt(attackerAfter.winCount) > parseInt(attackerBefore.winCount)
      ) {
        winnerId = attackerZombieId;
        winnerZombie = attackerAfter;
      } else {
        winnerId = targetZombieId;
        winnerZombie = defenderAfter;
      }
      suspenseSound.pause();
      playCheerSound();
      document.getElementById("zombieArmy").innerHTML = `
          <div class="zombie winner fade-in" id="zombie-${winnerId}">
            <div class="fire-badge">Lv.${winnerZombie.level}</div>
            <h3>🏆 ${getZombieEmoji(winnerZombie.dna)} ${winnerZombie.name}</h3>
            <ul>
              <li><b>ID:</b> ${winnerId}</li>
              <li><b>DNA:</b> ${winnerZombie.dna}</li>
              <li><b>Level:</b> ${winnerZombie.level}</li>
              <li><b>Wins:</b> ${winnerZombie.winCount}</li>
              <li><b>Losses:</b> ${winnerZombie.lossCount}</li>
              <li><b>Ready:</b> ${new Date(winnerZombie.readyTime * 1000).toLocaleString()}</li>
            </ul>
            <button onclick="levelUpZombie(${winnerId})">🚀 Level Up</button>
          </div>
        `;

      displayStatus(`🏅 Zombie ID ${winnerId} wins clearly!`);
    })
    .on('error', (err) => displayStatus(err.message));
}

function hideZombies() {
  document.getElementById("zombieArmy").innerHTML = "";
  displayStatus("");
}

function getZombieEmoji(dna) {
  const zombieEmojis = ["🧟‍♂️", "🧟‍♀️", "🧟"];
  return zombieEmojis[dna % zombieEmojis.length];
}