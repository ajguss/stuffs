var express = require('express');
GLOBAL.passport = require('passport');
var util = require('util');
var session = require('express-session');
var SteamStrategy = require('passport-steam').Strategy;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var User = require('./resources/util/js/user');
var request = require("request");


var handlebars = require('express3-handlebars')
 .create({ defaultLayout: 'main' });
 
var routes = require('./routes/index');
var deposit = require('./routes/deposit');
 
GLOBAL.localIp = 'localhost';
GLOBAL.title = 'CSGOMeme';

MongoClient.connect("mongodb://localhost:27017/csgomemedb", function(err, db)
{
    if(err)
    {
        console.log("Unsuccessful Database Connection");
        console.error(err);
    }
    else
    {
        console.log("Connected To Datbase");
        GLOBAL.database = db;
    }
    
});

//passport setup
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new SteamStrategy(
{
    returnURL: 'http://' + GLOBAL.localIp + ':3000/auth/steam/return',
    realm: 'http://' + GLOBAL.localIp + ':3000/',
    apiKey: '4330978285A7B4D920920B661D2E5A43'
},
function(identifier, profile, done)
{
    return done(null, profile);
}
));

var signed = false;
var avatar = null;
var sname = null;
var inv;
var rgdesc;
var invContext = "[ ";

var app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
//Use passport authentication things
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(__dirname + '/public'));



app.get('/', function (req, res) {
	
	res.render('home', {
		avatar: app.locals.avatar,
		name: app.locals.steamName,
		item: [ { name: 'Operation Wildfire Case', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFYxnaeQImRGu4S1x9TawfSmY-iHkmoD7cEl2LiQpIjz3wPl_ERkYWHwLY-LMlhp9pkR_UQ' },{ name: 'Chroma 2 Case', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFAuhqSaKWtEu43mxtbbk6b1a77Twm4Iu8Yl3bCU9Imii1Xt80M5MmD7JZjVLFH-6VnQJQ' },{ name: 'Falchion Case', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FF8ugPDMIWpAuIq1w4KIlaChZOyFwzgJuZNy3-2T89T0jlC2rhZla2vwIJjVLFHz75yKpg' },{ name: 'Operation Breakout Weapon Case', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFMu1aPMI24auITjxteJwPXxY72AkGgIvZAniLjHpon2jlbl-kpvNjz3JJjVLFG9rl1YLQ' },{ name: 'Five-SeveN | Orange Peel (Field-Tested)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLhRlxfbGTi5S08i3hIW0mOX1PbzUqWZU7Mxkh6eQp9zwjgbg-hY_ajj3ddCQdVRvYQ3Y-lHoxOy7gMK6tZudziYx7yF3-z-DyM_tqitn' },{ name: 'Shadow Case', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FF4u1qubIW4Su4mzxYHbzqGtZ-KGlz8EuJcg3rnE9NiijVe3_UY-Zzr2JJjVLFEEeiQRtg' },{ name: 'Sticker | Ninjas in Pyjamas (Holo) | MLG Columbus 2016', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXQ9QVcJY8gulReQ0DFSua4xJ2DAgs7Kw1HibKqJwgu0qWRIThAtYTjzYWPlKOia7iAwjlTvpchjLyX89-siwGwqktvY2nyI5jVLFGvDUc4hA' },{ name: 'Sticker | Astralis (Holo) | MLG Columbus 2016', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXQ9QVcJY8gulReQ0DFSua4xJ2DAgs7JBdDpIWtJAtvnaKfKDsRvI7gxNDbxvGhYO3SxGpVvcByiO2WpNn32wDj-EM4aj2hdoGLMlhpiarajW4' },{ name: 'Sticker | Snax (Foil) | MLG Columbus 2016', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXQ9QVcJY8gulReQ0DFSua4xJ2DAgs7Ng1QiamrKh9f1fzBfXNEvo3jkNDakaHxMe6IxzwEvJ0ijuyR9Iqm2lXlrkQ-NzygIIKWIVM5fxiOrU6nD4R-' },{ name: 'SCAR-20 | Army Sheen (Minimal Wear)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopbmkOVUw7PLFTjxQ4cWJh4iCmfLLP7LWnn8fusEjjLHDoo-ljAW1_RVlZm3yLYOTJgdsNA7Q-1m8x--70cK0vJjNy2wj5HdbrGOTFQ' },{ name: 'P2000 | Granite Marbleized (Field-Tested)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovrG1eVcwg8zAaAJF_t24nZSOqPrxN7LEmyUB6pwl2r2U84-h2VG1-hA6MWimJ4GRIAU2NAmC-QLvkLjsjJftup3L1zI97T2fu0Hu' },{ name: 'Revolver Case', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFYwnfKfcG9HvN7iktaOkqD1auLTxD5SvZYgiLvFpo7xjVLh-kdrYWnzcoGLMlhpsyM-5vg' },{ name: 'Negev | Desert-Strike (Field-Tested)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpouL-iLhFf0Ob3fzhF6cqJgImflvnnJ7TDm1Rc7cF4n-SPot7zjAO28xBlMGD2LNKRdVU7ZV_R_Fm-xLvphJK7v5vBzXFr7yIm5mGdwUK5_zczUg' },{ name: 'P2000 | Ivory (Well-Worn)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovrG1eVcwg8zLZAJSvozmxL-CgfjmKoTck29Y_cg_juiRpdyt3gGyqEZoMjinJYaUdQE-aQ7Xq1G_w7-8h5-56ZXIynEyvT5iuyhtmZwA4A' },{ name: 'XM1014 | Scumbria (Well-Worn)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgporrf0e1Y07PLZTiVPvYznwL-YlOL5ManYl1Rc7cF4n-SP8NSkjgHkr0c4Nm_7I9eTegVsaAnR8wW6l-u9gZO17Z6czyEw7Cdz5GGdwULtYoCFYg' },{ name: 'Nova | Caged Steel (Factory New)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpouLWzKjhh3szHZzxO09SzjL-HnvD8J_WGwD0AuZ0o07nDptun3gLl_BY4ZWvzJ9Ocd1dsMl_R_lC5lby7hZO7ot2XnnibtMPm' },{ name: 'UMP-45 | Carbon Fiber (Factory New)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1Jf0v73cjxQ7tO4q4aClfLmDLfYkWNFpscj37nDrdqlilax_RVrMm_7LYKRelVtZV-C_ADtw-vrh5Hpv8nBzXp9-n517oYZno4' },{ name: 'Nova | Predator (Field-Tested)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpouLWzKjhzw8zSdD9Q7d-3mb-GkvP9JraflG0E7cEo2bCZ8Nmj2AK1-xE-YmmlIYSVdw85YlzQ8we4l73v1sXovoOJlyV9l0gMjQ' },{ name: 'Operation Phoenix Weapon Case', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFUuh6qZJmlD7tiyl4OIlaGhYuLTzjhVupJ12urH89ii3lHlqEdoMDr2I5jVLFFSv_J2Rg' },{ name: 'UMP-45 | Gunsmoke (Field-Tested)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1Jf2-r3djhO_Nm4q42Ok_7hPvWHwDkJu8Ao3uzA9I-kigbk-0Q5ZWGidYGddg84ZVDT_Vfrk-no0Je7ot2XnjSEoaSR' },{ name: 'USP-S | Forest Leaves (Well-Worn)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ08-mq4yOluHxIITck29Y_cg_373Fpo7z0QW18hBsY2_yJdKcIwZoaFnYqFXtw-juhcLtuJXNzSNhsj5iuyhKbQ0iow' },{ name: 'Dual Berettas | Stained (Well-Worn)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpos7asPwJf0uL3dzJQ79myq42Ok_7hPvWEkjkFsMck3OrDpdql3Fbl_hJuam7yLdfBJgc3ZwzS-we9k7jo1MPpot2XniJLv09Z' },{ name: 'MAC-10 | Candy Apple (Minimal Wear)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldfwPz3YzhG09C_k4if2aD2Y-6DlDsHscQp2L6RoNWs2VDm8xU_NWv0JYTBdABsNAzT_AC-kObxxcjrpiSwxaw' },{ name: 'UMP-45 | Carbon Fiber (Factory New)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1Jf0v73cjxQ7tO4q4aClfLmDLfYkWNFpscj37nDrdqlilax_RVrMm_7LYKRelVtZV-C_ADtw-vrh5Hpv8nBzXp9-n517oYZno4' },{ name: 'Chroma Case', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFEuh_KQJTtEuI63xIXbxqOtauyClTMEsJV1jruS89T3iQKx_BBqa2j3JpjVLFH1xpp0EQ' },{ name: 'FAMAS | Cyanospatter (Field-Tested)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLuoKhRf2-r3YzhH6uO7kYSCgvq6ar-HxW8I7JIk0ujF8Yil31Hl_RY9Yzv7JoWSJgA4MlHSrge9wO_mjYj84soWCGKLvQ' },{ name: 'M4A4 | Urban DDPAT (Field-Tested)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhoyszMdS1D-OOjhoK0mvLwOq7c2DgJsJEljrmSodSh0Ae3rhA_YWr2doOUc1I6NV3W_ljswufph8S96JrXiSw0sGdhRtI' },{ name: 'MAG-7 | Metallic DDPAT (Factory New)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7uifDhh3szdYz9D4uO6nYeDg7mgariClDMFusQh2LiTo9nw0FCw_UU6Y2ymdtOXclBtZl6B_AXolby-m9bi6yrTVV9L' },{ name: 'XM1014 | Blue Steel (Field-Tested)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgporrf0e1Y07PLZTj9O-dmyq42Ok_7hPvWFxz0J68B1i7iXrN6sjgHh8xVtZW37I4eVcgVvY13Z_gS6l-i908fpot2XnpIhBtwd' },{ name: 'Dual Berettas | Dualing Dragons (Well-Worn)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpos7asPwJf0Ob3dShD4N6zhpKOg-P1DL_Dl2xe5tZOh-zF_Jn4xgHh_UY6YWv7cNPHcFBtYguD-Fbsx-rsh5e-upXIyXE3vydwtC3dykOpwUYb4qDnZ3s' },{ name: 'MAG-7 | Seabird (Well-Worn)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7uifDhz3MzJYChD09GzkImemrmnMOnQkzhQsJR307rFpNX0igLg-UNuYD36I9fAewI3Z1uD_Fi5xbvom9bi6yU_C7fU' },{ name: 'P250 | Metallic DDPAT (Factory New)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhh3szdYz9D4uO6nYeDg7mmNe3UkD8GsMEo3erDp9St31K3_0JsZTqlLI-SdA5oZwuDqQW2lLrpm9bi6_KhRAkC' },{ name: 'Galil AR | VariCamo (Factory New)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbupIgthwczAaAJU7c6_l4GGmMj4OrzZgiUFsJwij-3E89qt2wzh-Us6Mj2gd4bEdQ8-MFiFrlC9w72705Tqvc_A1zI97VeOATXT' },{ name: 'AUG | Condemned (Field-Tested)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot6-iFBRw7P7NYjV96tOkkZOfqPH9Ib7um25V4dB8xLuVoIqkiVHtrkFoMGjzdoSWdwY6aFvX_Vfow-_mhJS5vs_IwHRhuyk8pSGK2gnD2Gc' },{ name: 'UMP-45 | Carbon Fiber (Factory New)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1Jf0v73cjxQ7tO4q4aClfLmDLfYkWNFpscj37nDrdqlilax_RVrMm_7LYKRelVtZV-C_ADtw-vrh5Hpv8nBzXp9-n517oYZno4' },{ name: 'MP9 | Orange Peel (Field-Tested)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FBRw7OfJYTh94863moeOqPrxN7LEmyUJ6pJ33L-Xpd_03gHlrURvN270LNORJAM2aVjW-gC3yby905K0vpmb1zI97c4iLXaH' },{ name: 'XM1014 | Blue Steel (Well-Worn)', url: 'http://cdn.steamcommunity.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgporrf0e1Y07PLZTj9O-dmyq42Ok_7hPvWFxz0J68B1i7iXrN6sjgHh8xVtZW37I4eVcgVvY13Z_gS6l-i908fpot2XnpIhBtwd' }, ]
		//item: invContext,
	});
	
	
});
app.get('/play', function (req, res) {
	
	res.render('play' , {
		avatar: app.locals.avatar,
		name: app.locals.steamName,
		item: JSON.parse(invContext),
	});
	
	
});
app.get('/about', function (req, res) {
    res.render('about');
});
app.get('/auth/steam', passport.authenticate('steam'), function(req, res) {});
app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), 
    function(req, res) 
    {
        req.session.user = new User(req.user, function()
        {
			
			app.locals.avatar = req.session.user.avatar;
			app.locals.steamName = req.session.user.displayName;
			//res.render('home');
             
			request(req.session.user.inv, function(error, response, body) {
				inv = JSON.parse(body);
				
				rgdesc = inv.rgDescriptions;
				for (var i in rgdesc){
					if(rgdesc[i].tradable == 1){
					invContext += "{ name: '" + rgdesc[i].market_name + "', url: 'http://cdn.steamcommunity.com/economy/image/" + rgdesc[i].icon_url + "' },";
					//console.log(rgdesc[i]);
				}
				}
				invContext += " ]"
				console.log(invContext);
				invContext = JSON.parse(invContext);
			});
			res.redirect('/');
        });
		
		
    });
// 404 catch-all handler (middleware)
app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});
// 500 error handler (middleware)
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' +
 app.get('port') + '; press Ctrl-C to terminate.');
});
