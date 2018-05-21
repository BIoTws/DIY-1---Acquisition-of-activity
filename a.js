const gpio = require("gpio");
const biotCore = require('biot-core');
const ChannelsManager = require('biot-core/lib/ChannelsManager');

let minAmount = 1500;
let ledQueue = [];
let active = false;

async function start() {
	await biotCore.init('test');
	let wallets = await biotCore.getMyDeviceWallets();
	let arrAddresses = await biotCore.getAddressesInWallet(wallets[0]);

	let balance = await biotCore.getAddressBalance(arrAddresses[0]);
	console.error('balance', balance);
	if (balance.base.stable < minAmount) {
		return console.error('Please use the faucet or replenish your account')
	}

	const channelsManager = new ChannelsManager(wallets[0]);
	let list = await channelsManager.list();
	if (list.length) {
		list.forEach(async channel => {
			if (channel.step === 'waiting_transfers') {
				let _channel = channelsManager.recoveryChannel(channel);
				await _channel.closeNow();
			}
		});
	}

	channelsManager.events.on('newChannel', async (objInfo) => {
		console.error('new Channel: ', objInfo);
		let channel = channelsManager.getNewChannel(objInfo);
		channel.events.on('error', error => {
			console.error('channelError', channel.id, error);
		});
		channel.events.on('start', async () => {
			console.error('channel start. t.js', channel.id);
			led5.set();
			await timer(0.1);
			led5.set(0);
			await timer(0.1);
			led5.set();
			await timer(0.1);
			led5.set(0);
		});
		channel.events.on('changed_step', (step) => {
			// console.error('changed_step: ', step);
		});
		channel.events.on('new_transfer', async (amount, message) => {
			led5.set();
			await timer(0.1);
			led5.set(0);
			await timer(0.1);
			led5.set();
			await timer(0.1);
			led5.set(0);
			if (active) {
				ledQueue.push({led: message.led});
			}
			activateLed(message.led);
		});
		await channel.init();
		await channel.approve();
		console.error(channel.info());
	});
}

start().catch(console.error);

function timer(sec) {
	return new Promise(resolve => {
		setTimeout(resolve, sec * 1000);
	});
}

function activateLed(number) {
	led1.set(0);
	led2.set(0);
	led3.set(0);
	led4.set(0);

	active = true;
	console.error('activate led: ', number);
	switch (number) {
		case 1:
			led1.set();
			break;
		case 2:
			led2.set();
			break;
		case 3:
			led3.set();
			break;
		case 4:
			led4.set();
			break;
	}
	setTimeout(() => {
		if (ledQueue.length) {
			activateLed(ledQueue.shift());
		} else {
			active = false;
			led1.set(0);
			led2.set(0);
			led3.set(0);
			led4.set(0);
		}
	}, 3000);
}

let led1 = gpio.export(14, {
	direction: "out",
	ready: function () {
		console.error('ready:', 1);
		led1.set(0);
	}
});

let led2 = gpio.export(15, {
	direction: "out",
	ready: function () {
		console.error('ready:', 2);
		led2.set(0);
	}
});

let led3 = gpio.export(23, {
	direction: "out",
	ready: function () {
		console.error('ready:', 3);
		led3.set(0);
	}
});

let led4 = gpio.export(24, {
	direction: "out",
	ready: function () {
		console.error('ready:', 4);
		led4.set(0);
	}
});

let led5 = gpio.export(25, {
	direction: "out",
	ready: function () {
		console.error('ready:', 5);
		led5.set(0);
	}
});