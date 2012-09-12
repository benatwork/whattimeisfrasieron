$(document).ready(function() {

	var apiKey = "p6hxx8kswgzu2fvv7qje5rbn"
	var apiSecret = "dxJJqMrbSG"
	
	
	//frasier
	var showId = '830135';

	var providers = [];

	function init(){
		$('.container').append('<form>Zipcode: <input value="11217" type="number" name="zip" maxlength="5" /></form>');
		$('form').submit(function(e) {
		  
		  getService($('input').val());
		  return false;
		});
	}


	function getService(zip){
		console.log(zip);
		var serviceUrl = 'http://api.rovicorp.com/TVlistings/v9/listings/services/postalcode/'+zip+'/info?locale=en-US&countrycode=US&format=json&apikey=6bnt3uq55nnfe9sxfksgn9ms&callback=?'
		$.getJSON(serviceUrl, function(data) {
			var items = [];
			var areaString = "";
			$.each(data.ServicesResult.Services.Service, function(key, service) {
				providers.push(service);
			});
			$('.container').append('<select>');

			$('select').change(function(e) {
				providerSelected(e.currentTarget.value);
			});

			//populate service provider lists
			$.each(providers, function(key, service) {
				console.log(service);
				  if(service.City !== 'Eastern Time Zone') $('select').append('<option value='+service.ServiceId+'>'+service.SystemName+'</option>');
			});

			$('.container').append('</select>');

			
		});

	}
	function providerSelected(id){
		console.log(id,showId);

		var showUrl = 'http://api.rovicorp.com/TVlistings/v9/listings/programdetails/'+id+'/'+showId+'/info?locale=en-US&duration=10080&imagecount=5&include=Program&inprogress=0&format=json&apikey=6bnt3uq55nnfe9sxfksgn9ms&callback=?'
		$('.container').append('<div class="contents">loading...</div>');
		$.getJSON(showUrl, function(showData) {
			var airings = showData.ProgramDetailsResult.Schedule.Airings;
			$('.contents').html('<ul class="listings"></ul>');
			$.each(airings,function(key,airing){
				console.log(airing);
				$('.listings').append('<li>'+$.format.date(airing.AiringTime,"MM/dd/yyyy")+' on channel '+airing.Channel+' <br/> '+airing.Copy+'</li><hr>');
			})


			//$('.container').append()
		}).error(function(){
			console.log('error:'+e);
		})

	}

	init();

	
});