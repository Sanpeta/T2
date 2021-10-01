var express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
var app = express()
const bodyParser = require("body-parser");
const qr = require("qrcode");

//Models
const Product = require("./models/Product");
const User = require("./models/User");

mongoose.connect('mongodb://localhost:27017/topicosII_T2', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
})

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
})

//TODAS AS ROTAS RELACIONADAS COM USUARIO
//ADICIONANDO UM NOVO USUARIO
app.post("/addUser", async (req, res) => {
    var { name, email, password, discount } = req.body;
    await User.exists({ "email": email.toLowerCase() })
    .then(userFind => {
        if (!userFind) {
            var emailLower = email.toLowerCase();
            const addUser = new User({
                email: emailLower,
                name,
                password,
                discount
            });            
            addUser.save().then(() => {
                res.redirect("/listProducts");
            }).catch(err => {
                res.send(err);
            });
        } else {
            res.send("O E-mail: " + email.toLowerCase() + " já está sendo utilizado.");
        }
    }).catch(err => {
        res.send(err);
    })
});

//REMOVENDO UM USUARIO
app.get("/removeUser/:email", (req, res) => {
    var email = req.params.email;
    // --------------- Buscando o primeiro dado que aparecer  ---------
    User.findOneAndDelete(({"email": email.toLowerCase()}))
    .then(email => {
        res.send("Usuario deletado.");
    }).catch(err => {
        console.log(err);
    });
});

//PAGINA DE INFORMACOES DO USUARIO
app.get("/editUser/:email", async(req, res) => {
    var email = req.params.email;
    await User.findOne({ "email": email.toLowerCase() })
    .then(userFind => {
        if (userFind) {
            res.render("editUser", {user: userFind})
        } else {
            res.send("O E-mail não está cadastrado.");
        }
    }).catch(err => {
        res.send(err);
    })
});

//API
//PAGINA DE INFORMACOES DO USUARIO
app.get("/editUser/api/:email", async(req, res) => {
    var email = req.params.email;
    await User.findOne({ "email": email.toLowerCase() })
    .then(userFind => {
        if (userFind) {
            res.json({user: userFind});
            // res.render("editUser", {user: userFind})
        } else {
            res.send("O E-mail não está cadastrado.");
        }
    }).catch(err => {
        res.send(err);
    })
});

//ALTERANDO INFORMACOES DO USUARIO
app.post("/editUser", async (req, res) => {
    var { name, email, discount } = req.body;
    await User.findOneAndUpdate({ "email": email.toLowerCase() }, {
        name,
        email,
        discount
    }).then(() => {
        res.send("Dados Atualizados");
    }).catch(err => {
        res.send(err);
    });
});



//TODAS AS ROTAS RELACIONADAS COM PRODUTO
//LISTA DE PRODUTOS
app.get("/listProducts", (req, res) => {
    Product.find({}).then(products => {
        res.render("listProducts", {products: products});
    })
});

//LISTA DE PRODUTOS
//API
app.get("/listProducts/api", (req, res) => {
    Product.find({}).then(products => {
        res.json({products});
    })
});

//PEGANDO INFORMACOES DAQUELE PRODUTO EM ESPECIFICO
app.get("/product/:product", (req, res) => {
    var nameProduct = req.params.product;
    Product.findOne({ "name": nameProduct.toUpperCase() })
    .then((product) => {
        const name = product.name;
        let price = product.price;
        price = Math.round(price * 100) / 100
        const image = product.image;
        if (nameProduct.length === 0) res.send("Empty Data!");
        qr.toDataURL(nameProduct, (err, qrSrc) => {
            if (err) {
                res.send("Erro ao carregar QRCode");
            }
            res.render("product", {name, price, image, qrSrc})
        })
    });
});

//PEGANDO INFORMACOES DAQUELE PRODUTO EM ESPECIFICO
//API
app.get("/product/api/:product", (req, res) => {
    var nameProduct = req.params.product;
    Product.findOne({ "name": nameProduct.toUpperCase() })
    .then((product) => {
        const name = product.name;
        let price = product.price;
        price = Math.round(price * 100) / 100
        const image = product.image;
        if (nameProduct.length === 0) res.send("Empty Data!");
        res.json({name, price, image})
    });
});

//PEGANDO INFORMACOES DAQUELE PRODUTO EM ESPECIFICO PARA AQUELE CLIENTE
app.get("/product/check/:productName/:email", (req, res) => {
    var nameProduct = req.params.productName;
    var email = req.params.email;
    Product.findOne({ "name": nameProduct.toUpperCase() })
    .then((product) => {
        User.findOne(({"email": email}))
        .then(user => {
            const name = nameProduct.toUpperCase();
            let price = 0;
            if(user.discount == 0) {
                price = product.price
                price.toFixed(2);
            } else {
                price = product.price*((100-user.discount)/100);
                price = Math.round(price * 100) / 100
            }
            const image = product.image;
            res.render("product", {name, price, image, qrSrc: ""})
            // res.json({ name, price, image });
        }).catch(err => {
            console.log(err);
        });
    });
});

//API
//PEGANDO INFORMACOES DAQUELE PRODUTO EM ESPECIFICO PARA AQUELE CLIENTE
app.get("/product/check/api/:productName/:email", (req, res) => {
    var nameProduct = req.params.productName;
    var email = req.params.email;
    Product.findOne({ "name": nameProduct.toUpperCase() })
    .then((product) => {
        User.findOne(({"email": email}))
        .then(user => {
            const name = nameProduct.toUpperCase();
            let price = 0;
            if(user.discount == 0) {
                price = product.price
                price.toFixed(2);
            } else {
                price = product.price*((100-user.discount)/100);
                price = Math.round(price * 100) / 100
            }
            const image = product.image;
            // res.render("product", {name, price, image, qrSrc: ""})
            res.json({ name, price, image });
        }).catch(err => {
            console.log(err);
        });
    });
});

app.get("/addProduct", (req, res) => {
    res.render("addProduct");
});

//ADICIONANDO UM NOVO PRODUTO
app.post("/addProduct", async (req, res) => {
    var {name, price, image} = req.body;
    await Product.exists({"name": name.toUpperCase()})
    .then(productFind => {
        if(!productFind) {
            if(name != undefined && name != "") {
                const addProduct = new Product({
                    name: name.toUpperCase(),
                    price: price,
                    image: image
                });
                addProduct.save().then(() => {
                    res.redirect("/listProducts")
                }).catch(err => {
                    console.log(err);
                });
            } else {
                res.send("Favor preencher todos os campos.");
            }
        } else {
            res.send("O produto já está salva em nosso banco.");
        }
    }).catch(err => {
        res.send(err);
    });
});


app.get("/removeProduct", (req, res) => {
    Product.find({}).then(products => {
        res.render("removeProduct", {products: products});
    })
})

//REMOVENDO UM PRODUTO
app.post("/removeProduct", (req, res) => {
    var {name} = req.body;
    // --------------- Buscando o primeiro dado que aparecer  ---------
    Product.deleteOne(({"name": name}))
    .then(() => {
        res.redirect("/removeProduct");
    }).catch(err => {
        console.log(err);
    });
})


//PAGINA COM A LISTA DE TODOS OS PRODUTOS PARA DEPOIS ALTERAR O PRODUTO EM ESPECIFICO
app.get("/listEditProducts", async (req, res) => {
    Product.find({}).then(products => {
        res.render("listToEditProduct", {products: products});
    })
});

//PAGINA PARA ALTERAR O PRODUTO
app.get("/editProduct/:name", async (req, res) => {
    var name = req.params.name;
    await Product.findOne({ "name": name.toUpperCase() })
    .then(productFind => {
        if (productFind) {
            res.render("editProduct", {product: productFind})
        } else {
            res.send("Produto não cadastrado.");
        }
    }).catch(err => {
        res.send(err);
    })
});

//ALTERANDO INFORMACAO DO PRODUTO
app.post("/editProduct", async (req, res) => {
    var {name, price, image} = req.body;
    await Product.findOneAndUpdate({ "name": name.toUpperCase() }, {
        name,
        price,
        image
    }).then(() => {
        res.redirect("/listEditProducts")
    }).catch(err => {
        res.send(err);
    });
});


//INICIANDO O SERVIDOR
app.listen(4000, () => {
    console.log("Servidor Web rodando");
});