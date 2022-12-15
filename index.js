const core = require('@actions/core');
const firebase = require('firebase');
require('firebase/firestore');

const isRequired = {
	required: true,
};

const initFirebase = () => {
	try {
		core.info('Initialized Firebase Connection');
		const firebaseConfig = {
			apiKey: core.getInput('apiKey', isRequired),
			authDomain: core.getInput('authDomain', isRequired),
			databaseURL: core.getInput('databaseURL', isRequired),
			projectId: core.getInput('projectId', isRequired),
			storageBucket: core.getInput('storageBucket', isRequired),
			messagingSenderId: core.getInput('messagingSenderId', isRequired),
			appId: core.getInput('appId', isRequired),
			measurementId: core.getInput('measurementId', isRequired),
		};

		firebase.initializeApp(firebaseConfig);
	} catch (error) {
		core.setFailed(JSON.stringify(error));
		process.exit(core.ExitCode.Failure);
	}
};

const getValue = () => {
	core.info('Trying to parse expected value');
	const value = core.getInput('value');

	if (!value) {
		return Date.now();
	}

	try {
		return JSON.parse(value);
	} catch {
		const num = Number(value);

		if (isNaN(num)) {
			return value;
		}

		return num;
	}
};

const updateFirestoreDatabase = (path, value) => {
	core.info(
		`Updating Firestore Database with a new document at collection: ${path}`
	);

	firebase
		.firestore()
		.collection(path)
		.add(value)
		.then(
			(res) => {
				core.setOutput('response', res);
				process.exit(core.ExitCode.Success);
			},
			(reason) => {
				core.setFailed(JSON.stringify(reason));
				process.exit(core.ExitCode.Failure);
			}
		);
};

const processAction = () => {
	initFirebase();

	try {
		const path = core.getInput('path', isRequired);
		const value = getValue();

		updateFirestoreDatabase(path, value);

		const payload = JSON.stringify(github.context.payload, undefined, 2);
		console.log(`The event payload is ${payload}`);
	} catch (error) {
		core.setFailed(JSON.stringify(error));
		process.exit(core.ExitCode.Failure);
	}
};

processAction();
