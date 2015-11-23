(function($) {
    'use strict';

    var Pesten = function(content_element) {
        var obj = this;
        var divided = false;
        var rules_showed = false;
        var winner = null;
        var last_info = '';

        /*
        Kaarten verdelen onder de spelers

        Iedere speler krijgt 7 kaarten de rest van de kaarten worden op een
        stapel gelegd om af te kunnen pakken als er geen zet mogelijk is.
         */
        obj.divide_cards = function() {
            for (var i = 0; i < 4; i++) {
                var player = obj.players[i];

                for (var j = 0; j < 7; j++) {
                    var index = Math.floor(Math.random() * (obj.stack.length));
                    player[j] = obj.stack[index];
                    obj.stack.splice(index, 1);
                }
            }

            var index = Math.floor(Math.random() * (obj.stack.length));
            obj.current_card = obj.stack[index];
            obj.used_cards.push(obj.current_card);
            obj.stack.splice(index, 1);
        };

        /*
        De kaarten van de spelers weergeven op het scherm.
         */
        obj.draw_cards = function(player) {
            var player_name;
            var title;

            if (player != 0) {
                player_name = 'Speler '+(player+1)+': (computer)';
            } else {
                player_name = 'Speler '+(player+1)+':';
            }

            title = '<p class="title">'+player_name+'</p>';

            content_element.innerHTML += title+'<div id="player'+(player+1)+'"></div>';

            var el_player = document.getElementById('player'+(player+1));

            for (var i = 0; i < obj.players[player].length; i++) {
                el_player.innerHTML += '<div class="card" id="'+obj.players[player][i]+'"></div>';
            }
        };

        /*
        De stapel met kaarten weergeven op het scherm.
         */
        obj.draw_stack = function() {
            content_element.innerHTML += '<p class="title">Stok:</p><div id="stack_container"></div>';

            var el_stack = document.getElementById('stack_container');

            el_stack.innerHTML += '<div class="card_back" id="stack"></div>';

            el_stack.innerHTML += '<div class="card" id="'+obj.current_card+'"></div>';
        };

        obj.draw_information = function() {
            var el_info = document.getElementById('information');

            if (!el_info) {
                content_element.innerHTML += '<div id="information"></div>';
                el_info = document.getElementById('information');
            }

            el_info.innerHTML = '';

            el_info.innerHTML += '<p>Huidige speler: '+(obj.current_turn+1)+'</p>';
            el_info.innerHTML += '<p>Aantal kaarten op stapel: '+(obj.stack.length)+'</p>';

            if (winner) {
                el_info.innerHTML += '<p>Winnaar: speler '+(winner)+'</p>';
            }

            if (last_info) {
                el_info.innerHTML += '<p><small>'+last_info+'</small></p>';
            }

            el_info.innerHTML += '<p><button id="replay">Nieuw spel</button></p>';

            document.getElementById('replay').addEventListener('click', function() {
                window.location.reload();
            });
        };

        obj.draw_type_choice = function() {
            //obj.clear_screen();

            content_element.innerHTML += '<div id="choice"></div>';

            var el_choice = document.getElementById('choice');

            el_choice.innerHTML = '<div id="choice_content"></div>';

            var el_content = document.getElementById('choice_content');

            el_content.innerHTML = '<h3>Kies een soort</h3>';
            el_content.innerHTML += '<p>Omdat u een boer heeft opgegooid mag u kiezen met welke soort de volgende speler moet uitkomen.</p>';
            el_content.innerHTML += '<p><button id="choice_h">Harten</button></p>';
            el_content.innerHTML += '<p><button id="choice_r">Ruiten</button></p>';
            el_content.innerHTML += '<p><button id="choice_k">Klaveren</button></p>';
            el_content.innerHTML += '<p><button id="choice_s">Schoppen</button></p>';

            document.getElementById('choice_h').addEventListener('click', function(){obj.change_type('H');});
            document.getElementById('choice_r').addEventListener('click', function(){obj.change_type('R');});
            document.getElementById('choice_k').addEventListener('click', function(){obj.change_type('K');});
            document.getElementById('choice_s').addEventListener('click', function(){obj.change_type('S');});
        };

        obj.change_type = function(type) {
            obj.current_card = type+'0';

            obj.next_turn();
            obj.start();
        };

        obj.draw_rules = function() {
            content_element.innerHTML += '<div id="rules"></div>';

            var el_rules = document.getElementById('rules');

            el_rules.innerHTML = '<div id="rules_content"></div>';

            var el_content = document.getElementById('rules_content');

            el_content.innerHTML = '<h3>Regels pesten</h3>';
            el_content.innerHTML += '<ul><li>Zeven blijft kleven (De huidige speler mag nog een kaart opgooien).</li><li>Acht wacht (De volgende speler moet een beurt overslaan).</li><li>Bij een 2 moet de volgende speler 2 kaarten pakken.</li><li>Bij een boer mag de huidige speler de soort van de volgende kaart bepalen.</li><li>Bij een joker moet de volgende speler 5 kaarten pakken.</li></ul>';
            el_content.innerHTML += '<p><button id="start_game">Beginnen!</button></p>';

            rules_showed = true;

            document.getElementById('start_game').addEventListener('click', obj.start);
        };

        obj.draw_end = function() {
            content_element.innerHTML += '<div id="end"></div>';

            var el_end = document.getElementById('end');

            el_end.innerHTML = '<div id="end_content"></div>';

            var el_content = document.getElementById('end_content');

            el_content.innerHTML = '<h1>Speler '+winner+' heeft gewonnen!</h1>';
            el_content.innerHTML += '<p><button id="end_start">Nieuw spel</button>';

            document.getElementById('end_start').addEventListener('click', function() {window.location.reload();});
        };

        /*
        De event listeners koppelen aan de kaarten en knoppen.
         */
        obj.set_listeners = function() {
            var cards = document.querySelectorAll('#player1 .card');

            for(var i = 0; i < cards.length; i++) {
                cards[i].addEventListener('click', function() {
                    if (obj.current_turn != 0) {
                        alert('U bent nu niet aan de beurt!');
                        return;
                    }
                    obj.play_card(0, this);
                });
            }

            document.getElementById('stack').addEventListener('click', function() {
                if (obj.current_turn != 0) {
                    alert('U bent nu niet aan de beurt!');
                    return;
                }
                obj.retreive_card(0);
                obj.next_turn();
            });
        };

        /*
        De speler ontvangt een kaart.

        Dit kan komen doordat de speler geen zet kan maken of
        doordat de vorige speler een 2 of joker heeft opgegooid.
         */
        obj.retreive_card = function(player) {
            if (obj.stack.length <= 0) {
                if (obj.used_cards.length <=1) {
                    alert('De kaarten zijn op!');
                    return;
                }

                obj.stack = obj.used_cards;
                obj.used_cards = [];

                var index = obj.stack.indexOf(obj.current_card);
                obj.stack.splice(index,1);
            }

            var index = Math.floor(Math.random() * (obj.stack.length));
            obj.players[player].push(obj.stack[index]);
            obj.stack.splice(index, 1);

            last_info = 'Speler '+(player+1)+' heeft een kaart gepakt.';
            console.info(last_info);

            obj.start();
        };

        /*
        De speler speelt een kaart.

        Als de speler een 2 opgooit moet de volgende speler 2 kaarten pakken.

        Als de speler een 7 opgooit mag de speler nog een kaart opgooien.

        Als de speler een 8 opgooit moet de volgende speler één beurt overslaan.

        Als de speler een joker opgooit moet de volgende speler 5 kaarten pakken.
        Die speler mag dan ook iedere kaart opgooien die hij graag kwijt wil.
         */
        obj.play_card = function(player, el_card) {
            var next_player;
            var prev_player;

            var card = el_card.id;
            var type = card.substring(0,1);
            var value = card.substring(1);

            var curr_type = obj.current_card.substring(0,1);
            var curr_value = obj.current_card.substring(1);

            if (type == curr_type || value == curr_value || value == 'K' || value == 'O' || curr_value == 'K' || curr_value == 'O') {
                switch(value) {
                    case '2':
                        if (player >= 3) {
                            next_player = 0;
                        } else {
                            next_player = player+1;
                        }

                        obj.retreive_card(next_player);
                        obj.retreive_card(next_player);
                        break;

                    case '7':
                        if (player <= 0) {
                            prev_player = 3;
                        } else {
                            prev_player = player-1;
                        }

                        obj.current_turn = prev_player;

                        last_info = 'Speler '+(player+1)+' mag nog een kaart opgooien.';
                        obj.draw_information();
                        console.log(last_info);
                        break;

                    case '8':
                        if (player >= 3) {
                            next_player = 0;
                        } else {
                            next_player = player+1;
                        }

                        obj.current_turn = next_player;

                        last_info = 'Speler '+(next_player+1)+' moet een beurt overslaan.';
                        obj.draw_information();
                        console.log(last_info);
                        break;

                    case 'B':
                        if (player == 0) {
                            obj.used_cards.push(card);
                            obj.players[player].splice(obj.players[player].indexOf(card), 1);

                            last_info = 'Speler '+(player+1)+' heeft '+card+' gespeeld.';
                            console.info(last_info);
                            obj.draw_type_choice();
                            return;
                        } else {
                            var random = Math.floor(Math.random() * 4);
                            var type;
                            var msg;

                            switch (random) {
                                case 1:
                                    type = 'H';
                                    msg = 'harten';
                                    break;

                                case 2:
                                    type = 'R';
                                    msg = 'ruiten';
                                    break;

                                case 3:
                                    type = 'S';
                                    msg = 'schoppen';
                                    break;

                                case 4:
                                    type = 'K';
                                    msg = 'klaveren';
                                    break;

                                default:
                                    type = 'H';
                                    msg = 'harten';
                                    break;
                            }

                            obj.used_cards.push(card);
                            obj.current_card = card;
                            obj.players[player].splice(obj.players[player].indexOf(card), 1);
                            last_info = 'Speler '+(player+1)+' heeft '+card+' gespeeld.';
                            console.info(last_info);
                            alert('De volgende kaart moet een '+msg+' zijn.');
                            obj.next_turn();
                            obj.current_card = type+'0';
                            obj.start();
                            return;
                        }
                        break;

                    case 'K':
                    case 'O':
                        if (player >= 3) {
                            next_player = 0;
                        } else {
                            next_player = player+1;
                        }

                        for (var i = 0; i < 5; i++) {
                            obj.retreive_card(next_player);
                        }
                        break;
                }

                obj.used_cards.push(card);
                obj.current_card = card;
                obj.players[player].splice(obj.players[player].indexOf(card), 1);

                last_info = 'Speler '+(player+1)+' heeft '+card+' gespeeld.';
                console.info(last_info);

                obj.next_turn();
                obj.start();
                return;
            }

            alert('Dat is geen geldige zet. Indien u geen kaart kan opgooien pak dan een extra kaart.');
        };

        obj.next_turn_2 = function() {
            for (var i = 0; i < obj.players.length; i++) {
                if (obj.players[i].length <= 0) {
                    last_info = 'Speler '+(i+1)+' heeft gewonnen!!';
                    winner = i+1;
                    obj.draw_end();
                    obj.draw_information();
                    return;
                }
            }

            if (obj.current_turn >=3) {
                obj.current_turn = 0;
            } else {
                obj.current_turn = obj.current_turn+1;
            }

            obj.draw_information();

            if (obj.current_turn != 0) {
                obj.computer_play();
            }
        };

        obj.next_turn = function() {
            setTimeout(obj.next_turn_2, 1000);
        };

        obj.computer_play = function() {
            var player = obj.current_turn;

            var card = obj.computer_play_pick_card(player);

            if (card === false) {
                obj.retreive_card(player);
            } else {
                obj.play_card(player, card);
                return;
            }

            obj.next_turn();
        };

        obj.computer_play_pick_card = function(player) {
            var curr_type = obj.current_card.substring(0,1);
            var curr_value = obj.current_card.substring(1);

            for (var i = 0; i < obj.players[player].length; i++) {
                var card = obj.players[player][i];
                var type = card.substring(0,1);
                var value = card.substring(1);

                if (type == curr_type || value == curr_value || value == 'K' || value == 'O' || curr_value == 'K' || curr_value == 'O') {
                    return document.getElementById(card);
                }
            }

            return false;
        };

        /*
        Het scherm leeg maken
         */
        obj.clear_screen = function() {
            content_element.innerHTML = '';
        };

        /*
        De stok kaarten

        Dit zijn de kaarten die na het delen nog over zijn en dus op een stapel liggen.

        H = Harten      HA = Harten aas, enz.
        S = Schoppen    SA = Schoppen aas, enz.
        K = Klaveren    KA = Klaveren aas, enz.
        R = Ruiten      RA = Ruiten aas, enz.
        JO & JK = Joker
         */
        obj.stack = [
            "HA",   "H2",   "H3",   "H4",   "H5",   "H6",   "H7",   "H8",   "H9",   "H10",  "HB",   "HV",   "HH",
            "SA",   "S2",   "S3",   "S4",   "S5",   "S6",   "S7",   "S8",   "S9",   "S10",  "SB",   "SV",   "SH",
            "KA",   "K2",   "K3",   "K4",   "K5",   "K6",   "K7",   "K8",   "K9",   "K10",  "KB",   "KV",   "KH",
            "RA",   "R2",   "R3",   "R4",   "R5",   "R6",   "R7",   "R8",   "R9",   "R10",  "RB",   "RV",   "RH",
            "JO",   "JK"
        ];

        /*
        De kaarten van de spelers
         */
        obj.players = [
            [],
            [],
            [],
            []
        ];

        /*
        Dit is de kaart waar de spelers een andere kaart op moeten gooien.
         */
        obj.current_card = "";

        /*
        Dit zijn de kaarten die al op gegooit zijn (inclusief de current_card)
         */
        obj.used_cards = [];

        obj.current_turn = 0;

        /*
        Dit is de functie om het spel te starten
         */
        obj.start = function() {
            if (!divided) {
                // Divide all the cards
                obj.divide_cards();
                divided = true;
            }

            // Draw functions
            obj.clear_screen();
            for(var i = 0; i < obj.players.length; i++) {
                obj.draw_cards(i);
            }
            obj.draw_stack();
            obj.draw_information();


            // Set listeners to all the cards
            obj.set_listeners();


            if (!rules_showed) {
                obj.draw_rules();
            }
        };

        // START HET SPEL :)
        obj.start();
    };

    window.addEventListener('load', function() {
        var game = new Pesten(document.getElementById('content'));
    });
})(jQuery);