
Template.tabUser_cats.helpers({
	userCats: function() {
		return _.map(this.data.cats, function(type) {
			return i18n('cats.place.'+type);
		});
	}
});