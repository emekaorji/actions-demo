import { info, getInput, setFailed, ExitCode, setOutput } from '@actions/core';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';

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

const initFirebase = () => {
	try {
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
	} catch (error) {
		setFailed(JSON.stringify(error));
		process.exit(ExitCode.Failure);
	}
};

const updateFirestoreDatabase = async (path, value) => {
	info(
		`Updating Firestore Database with a new document at collection: ${path}`
	);

	const app = initFirebase();
	const db = getFirestore(app);

	await addDoc(collection(db, path), { githubResponse: value });

	// firestore(app)
	// 	.collection(path)
	// 	.add(value)
	// 	.then(
	// 		(res) => {
	// 			setOutput('response', res.id);
	// 			process.exit(ExitCode.Success);
	// 		},
	// 		(reason) => {
	// 			setFailed(JSON.stringify(reason));
	// 			process.exit(ExitCode.Failure);
	// 		}
	// 	);
};

const processAction = async () => {
	try {
		const path = getInput('path', isRequired);
		const value = getValue();

		await updateFirestoreDatabase(path, value);

		const payload = JSON.stringify(github.context.payload, undefined, 2);
		console.log(`The event payload is ${payload}`);
	} catch (error) {
		setFailed(JSON.stringify(error));
		process.exit(ExitCode.Failure);
	}
};

processAction();
