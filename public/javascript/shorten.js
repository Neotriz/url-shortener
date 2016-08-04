$("#shorten-btn").click(function(e){
  e.preventDefault();
  var urlText = $("#url-field").val();
  $.ajax({
    url: '/api/shorten',
    type: 'POST',
    dataType: 'JSON',
    data: {long_url: urlText}, //data sending out to server is in JSON
    success: function(data){
      console.log(data)
      $("#shortenURL a").remove()
      $('#shortenURL').append('<a href="' + data.shortUrl + '">'+ data.shortUrlString +'</a>')
    }
  });
})
