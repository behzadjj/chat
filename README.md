# chat
Simple group chat with sharing multimedia files

Run

Server: 
1: cd ./server
2: yarn 
3: yarn serve

client:
1: cd ./client
2: yarn
3: yarn start

database:
1: Install mongodb locally or remote or you can use atlas (mongodb cloud).
2: For each one of those ./config.env should be set in the correct way.
	default config has been set for local mongodb with a database named "Mern"
	
	ATLAS_URI=mongodb://localhost:27017/Mern
	
	

After setting up you can go to http://localhost:3000/ and enter new records.