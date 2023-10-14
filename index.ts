import express from 'express';
import axios from "axios";
import querystring  from "node:querystring"
import 'dotenv/config'


const client_id = process.env.client_id;
const redirect_uri = process.env.redirect_uri;
const client_secret = process.env.client_secret



interface Response {
    access_token: string;
    token_type: string;
    expires_in: number;
}

const app = express();

app.get('/', (req,res) => {
    res.send("<a href='/login'>Login</a>")
});

app.get('/login', function(req, res) {

    let state = "ascvgbjuytrdsert";
    let scope = 'user-read-private user-read-email user-top-read';
    const redirect_uri = process.env.redirect_uri;

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/callback', async (req, res) => {
    let code = req.query.code || null;
    let state = req.query.state || null;

    if (state === null) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        const data = {
            grant_type: "authorization_code",
            code: `${code}`,
            redirect_uri: `${redirect_uri}`,
        };
        let authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            method: 'POST',
            form: {
                code: code,
                redirect_uri: redirect_uri,
            },
            data: querystring.stringify(data),
            headers: {
                Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
                contentType: "application/x-www-form-urlencoded",
            },
            json: true
        };
        const response = await axios(authOptions);
        const token = response.data.access_token
        let currentOptions = {
            url: 'https://api.spotify.com/v1/me',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                contentType: "application/x-www-form-urlencoded",
            },
            json: true
        };
        const current = await axios(currentOptions);
        const id = current.data.id;
        let topOptions = {
            url: 'https://api.spotify.com/v1/me/top/tracks?limit=30',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                contentType: "application/x-www-form-urlencoded",
            },
            json: true
        };
        const top = await axios(topOptions)
        const tracks = top.data.items
        const arr:any = [];
        tracks.forEach((i: any) => {
            console.log(i)
            arr.push(`${i.artists[0].name}:  ${i.name}`)
        })
        res.send(arr);
    }
})

app.get('/deirdre', (req, res) => {
    res.send('<h1>Hey Babe</h1>');
})

app.listen(3000, async () => {
    console.log('The application is listening on port 3000!');
})