function IGDB_get_id_data(clinet_id, access_token, game_ids) {

}

function IGDB_find_game(client_id, access_token, game_name) {
    /*
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.igdb.com/v4/games", true);
    xhr.setRequestHeader("Client-ID", client_id, "Authorization", `Bearer ${access_token}`);
    xhr.send(`fields*; search "${game_name}"`);
    */
   var games;
    $.ajax({
        method: "GET",
        headers: {
          "Client-ID": client_id,
          "Authorization": access_token
        },
        url:
          "https://api.igdb.com/v4/games",
        async: true,
        crossDomain: true
      })
        .done(function(response) {
          // Save the games
          games = response;
        })
        .fail(function() {
          alert("Unable to contact IGDB. Be sure to paste your API user key in the userKey variable at the top of the JS.");
        });
}