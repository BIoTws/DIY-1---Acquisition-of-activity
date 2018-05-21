const gpio = require("gpio");
const biotCore = require('biot-core');
const Channel = require('biot-core/lib/Channel');

let minAmount = 4000;
let peerPairingCode = 'A/btqLlcKH48tArT0MFtOv4pFdxwlpcyCLXJ/yBGECAG@biot.ws/bb-test#test';
let peerDeviceAddress = '024ENIFM6JNZQJ4M5B53EMVIW7YDR4SCW';

let initialized = false;
let channel;

async function start() {
	await biotCore.init('test');
	const device = require('byteballcore/device');
	let myDeviceAddress = device.getMyDeviceAddress();
	let wallets = await biotCore.getMyDeviceWallets();
	let arrAddresses = await biotCore.getAddressesInWallet(wallets[0]);

	await biotCore.addCorrespondent(peerPairingCode);

	let balance = await biotCore.getAddressBalance(arrAddresses[0]);
	console.error('balance', balance);
	if (balance.base.stable < minAmount) {
		return console.error('Please use the faucet or replenish your account')
	}

	channel = new Channel(wallets[0], myDeviceAddress, peerDeviceAddress, null, 2000, 1, 10);
	channel.events.on('error', error => {
		console.error('channelError', channel.id, error);
	});
	channel.events.on('start', async () => {
		console.error('channel start. t.js', channel.id);
		initialized = true;
	});
	channel.events.on('changed_step', (step) => {
		// console.error('changed_step: ', step);
	});
	channel.events.on('new_transfer', async (amount, message) => {

	});
	console.error('init', await channel.init());
}

start().catch(console.error);

async function changeLed(number) {
	await channel.transfer(2, {led: number});
}

let button1 = gpio.export(14, {
	direction: "in",
	ready: () => {
		console.error('ready:', 1);
	}
});

let button2 = gpio.export(15, {
	direction: "in",
	ready: () => {
		console.error('ready:', 2);
	}
});

let button3 = gpio.export(23, {
	direction: "in",
	ready: () => {
		console.error('ready:', 3);
	}
});

let button4 = gpio.export(24, {
	direction: "in",
	ready: () => {
		console.error('ready:', 4);
	}
});

button1.on("change", (val) => {
	if (val) {
		changeLed(1).catch(console.error);
	}
});

button2.on("change", (val) => {
	if (val) {
		changeLed(2).catch(console.error);
	}
});

button3.on("change", (val) => {
	if (val) {
		changeLed(3).catch(console.error);
	}
});

button4.on("change", (val) => {
	if (val) {
		changeLed(4).catch(console.error);
	}
});