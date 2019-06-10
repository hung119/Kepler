
Template.panelPlaceEdit.onRendered(function() {
	var self = this;
	
	self.$('.btn-editdel').btsConfirmButton(function(e) {

		Meteor.call('removePlace', self.data.id, function(err) {

			if(err)
				console.warn(err.message);
			else
			{
				K.Map.removeItem(K.placeById(self.data.id));
			
				Router.go('root');
			}
		});
	});

	Autosize( self.$('.input-desc') );

	self.$('#editMap')
	.on('hidden.bs.collapse', function(e) {
		if(self.editMap) {
			self.editMap.remove();
			delete self.editMap;
			delete self.newloc;
		}
	})
	.on('shown.bs.collapse', function(e) {
		if(!self.editMap) {

			var loc = self.data.loc,
				sets = K.settings.public,
				layerName = K.Profile.getOpts('map.layer') || K.settings.public.map.layer,
				layer = L.tileLayer(sets.map.layers[layerName]);

			var icon = new L.NodeIcon(),
				marker = L.marker(loc, {icon: icon});

			self.editMap = L.map($(e.target).find('.map')[0], {
				attributionControl:false,
				scrollWheelZoom:false,
				zoomControl:false,
				layers: layer,
				center: loc,
				zoom: 16
			}).on('move zoomstart', function(e) {

				var loc = self.editMap.getCenter(),
					newloc = K.Util.geo.locRound([loc.lat, loc.lng]);

				marker.setLatLng(newloc);

				self.$('.input-editloc').val(newloc.join(','))
			});

			L.control.zoom({
				position:'topleft',
				zoomOutText: i18n('map_zoomout'),
				zoomInText: i18n('map_zoomin'),
			}).addTo(self.editMap);


			if(self.data.geometry && self.data.geometry.type!=='Point')
				L.geoJson(self.data.geometry).addTo(self.editMap);

			marker.addTo(self.editMap);
			
			Blaze.renderWithData(Template.markerPlace, self, icon.nodeHtml);
		}
	});
});

Template.panelPlaceEdit.events({
	'click .btn-editren': function(e,tmpl) {
		var place = tmpl.data,
			data = {
				name: tmpl.$('.input-editren').val()
			};

		Meteor.call('updatePlace', place.id, data, function(err) {
			place.update();
		});
	},
	'keydown .input-editren': function(e,tmpl) {
		if(e.keyCode===13) {//enter
			e.preventDefault();
			tmpl.$('.btn-editren').trigger('click');
		}
	},
	'click .btn-cancren': function(e,tmpl) {
		tmpl.$('.input-editren').val('');
	},

	'keyup .input-url': _.debounce(function(e, tmpl) {
		var place = tmpl.data,
			input$ = $(e.target),
			data = {
				url: input$.val()
			};

		if(data.url.length && !K.Util.valid.url(data.url))
			K.Alert.error( i18n('edit_error_notUrl') );
		else {
			Meteor.call('updatePlace', place.id, data, function(err) {
				place.update();
			});
		}
	}, 300),
	'keydown .input-url': function(e,tmpl) {
		if(e.keyCode===13) {//enter
			e.preventDefault();
			$(e.target).trigger('keyup');
		}
	},

	/* //TODO	'keyup .input-editloc': _.debounce(function(e, tmpl) {
		e.preventDefault();
	}, 300),*/

	'click .btn-saveloc': function(e,tmpl) {
		
		var place = tmpl.data,
			data = {
				loc: K.Util.geo.locRound( tmpl.$('.input-editloc').val().split(',') )
			};

		Meteor.call('updatePlace', place.id, data, function(err) {
			place.update();
			tmpl.$('.collapse').collapse('hide');
		});
	},
	'click .btn-cancloc': function(e,tmpl) {
		tmpl.$('.collapse').trigger('hidden.bs.collapse');
		tmpl.$('.collapse').trigger('shown.bs.collapse');
		tmpl.$('.input-editloc').val( K.Util.geo.locRound(tmpl.data.loc) )
		//TODO decide beahvior tmpl.$('.collapse').collapse('hide');
	},
	
	'keyup .input-desc': _.debounce(function(e, tmpl) {
		var place = tmpl.data,
			input$ = $(e.target),
			data = {
				desc: input$.val()
			};

		if(data.desc.length) {
			Meteor.call('updatePlace', place.id, data, function(err) {
				place.update();
			});
		}
	}, 300),
	'keydown .input-desc': function(e,tmpl) {
		if(e.keyCode===13) {//enter
			e.preventDefault();
			$(e.target).trigger('keyup');
		}
	}
});

Template.tabUser_edit.events({
	'click .panel-btn-placesList': function(e, tmpl) {

		var icon$ = $(e.target).find('.icon');
		$(e.target).addClass('disabled');
		icon$.addClass('icon-loader');
		
		this.loadPlaces(function() {
			$(e.target).removeClass('disabled');
			icon$.removeClass('icon-loader');
		});
	}
});
