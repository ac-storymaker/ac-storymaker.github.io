var config = {
	apiKey: "AIzaSyCxgYOpG3GOeOvTxQnb-LquzwZqnwKg1n8",
	authDomain: "ac-storymaker.firebaseapp.com",
	databaseURL: "https://ac-storymaker.firebaseio.com",
	storageBucket: "ac-storymaker.appspot.com"
};
				
firebase.initializeApp(config);

var firebaseRef = firebase.database().ref();