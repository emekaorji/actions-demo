const core = require('@actions/core');
const firebase = require('firebase');

const isRequired = {
	required: true,
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

		const app = firebase.initializeApp(firebaseConfig);
		return app;
	} catch (error) {
		core.setFailed(JSON.stringify(error));
		process.exit(core.ExitCode.Failure);
	}
};

const updateFirestoreDatabase = (path, value) => {
	core.info(
		`Updating Firestore Database with a new document at collection: ${path}`
	);

	const app = initFirebase();

	firebase
		.firestore(app)
		.collection(path)
		.add(value)
		.then(
			(res) => {
				core.setOutput('response', res.id);
				process.exit(core.ExitCode.Success);
			},
			(reason) => {
				core.setFailed(JSON.stringify(reason));
				process.exit(core.ExitCode.Failure);
			}
		);
};

const processAction = () => {
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
