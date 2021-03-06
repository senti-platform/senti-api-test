require('dotenv').load()
const create = require('apisauce').create
const { encrypt } = require('senti-apicore')

const { ENCRYPTION_KEY, API_LOCAL, API_DEV, API_URL } = process.env

const apiRoute = '/holidays/v1/2018-01-01/2018-12-31/en'
const numRetry = 5

const setMode = () => {
	let args = process.argv.slice(2).toString()
	args ? console.log('API test mode:', args) : null
	switch (args) {
		case 'dev': return API_DEV
		case 'local': return API_LOCAL
		case 'prod': return API_URL
		// case '': return API_DEV
		default: return API_LOCAL
	}
}

const api = create({
	baseURL: setMode(),
	timeout: 30000,
	headers: {
		'auth': encrypt(ENCRYPTION_KEY)
	}
})

const apiCall = async (n) => {
	let response
	try {
		response = await api.get(apiRoute)
	} catch (error) {
		if (n === 1) {
			console.error(error)
		}
		response = await apiCall(n - 1)
	}
	// check response	
	if (response.ok && response.status == 200) {
		console.log('API/holidays:', response.status, Date())
		return response.data
	} else {
		console.log('API/holidays Error:', response.status, Date())
		process.exit(1)
	}
}

const result = async () => {
	let response
	response = await apiCall(numRetry)
	console.log(response)
	return
}

result()

/* 

Salling Group holidays API proxy
Date format: YYYY-MM-DD
https://dev.api.senti.cloud/holidays/v1/2018-01-01/2018-12-31/da
https://dev.api.senti.cloud/holidays/v1/2018-01-01/2018-12-31/en
/:version/:startdate/:enddate/:lang

 */
