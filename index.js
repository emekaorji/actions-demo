import * as core from '@actions/core';
import * as admin from 'firebase-admin';

let firebase;

const isRequired = {
	required: true,
};

const initFirebase = () => {
	try {
		core.info('Initialized Firebase Admin Connection');
		const credentials = core.getInput('credentials', isRequired);

		firebase = admin.initializeApp({
			credential: admin.credential.cert(JSON.parse(credentials)),
			databaseURL: core.getInput('databaseUrl'),
		});
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
	core.info(`Updating Firestore Database at collection: ${path}`);
	firebase
		.firestore()
		.collection(path)
		.add({ githubResponse: value })
		.then(
			() => {
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
	} catch (error) {
		core.setFailed(JSON.stringify(error));
		process.exit(core.ExitCode.Failure);
	}
};

processAction();
