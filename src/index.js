import { info, getInput, setFailed, ExitCode } from '@actions/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { context } from '@actions/github';

const isRequired = {
	required: true,
};

const getValue = () => {
	info('Trying to parse expected value');
	const value = getInput('value');

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

const getFirebaseApp = () => {
	info('Initialized Firebase Connection');
	const firebaseConfig = {
		apiKey: getInput('apiKey', isRequired),
		authDomain: getInput('authDomain', isRequired),
		databaseURL: getInput('databaseURL', isRequired),
		projectId: getInput('projectId', isRequired),
		storageBucket: getInput('storageBucket', isRequired),
		messagingSenderId: getInput('messagingSenderId', isRequired),
		appId: getInput('appId', isRequired),
		measurementId: getInput('measurementId', isRequired),
	};
	const app = initializeApp(firebaseConfig);

	return app;
};

const updateFirestoreDatabase = (path, value, id) => {
	info(`Updating Database with new data at ref: ${path}`);

	const app = getFirebaseApp();
	const database = getDatabase(app);

	set(ref(database, `${path}/${id}`), { value: value });
};

const processAction = () => {
	const path = getInput('path', isRequired);
	const id = getInput('id', isRequired);
	const value = getValue();

	try {
		updateFirestoreDatabase(path, value, id);

		const payload = JSON.stringify(context.payload, undefined, 2);
		console.log(`The event payload is ${payload}`);
	} catch (error) {
		setFailed(JSON.stringify(error));
		process.exit(ExitCode.Failure);
	}
};

processAction();
