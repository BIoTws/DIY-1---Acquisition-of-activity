const gpio = require("gpio");
const biotCore = require('biot-core');
const ChannelsManager = require('biot-core/lib/ChannelsManager');

const timeout = 20000; // 20 sec
const minAmount = 4000;
let peerPairingCode = 'AlPzda6EcehhEvUyHwgflLp7ARn5AODQCOOqGIxCsvRK@biot.ws/bb-test#test';
let peerDeviceAddress = '0NVWZAXA4YCZOQTQLQYVSS5ZKVRBYPOIE';

let initialized = false;
let channel;

async function start() {
	await biotCore.init('test');
	const device = require('byteballcore/device');
	let myDeviceAddress = device.getMyDeviceAddress();
	let wallets = await biotCore.getMyDeviceWallets();

	await biotCore.addCorrespondent(peerPairingCode);

	let balance = await biotCore.getWalletBalance(wallets[0]);
	console.error('balance', balance);
	if ((balance.base.stable + balance.base.pending) < minAmount) {
		return console.error('Please use the faucet or replenish your account')
	}

	const channelsManager = new ChannelsManager(wallets[0], timeout);
	channel = channelsManager.newChannel({
		walletId: wallets[0],
		myDeviceAddress,
		peerDeviceAddress,
		peerAddress: null,
		myAmount: 2000,
		peerAmount: 1,
		age: 10
	});

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
	if(initialized) {
		await channel.transfer(2, {led: number});
		console.error('buy led');
	}
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