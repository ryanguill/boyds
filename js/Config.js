function Config (args) {
	args = args || {};
	this.preyCount = args.preyCount || 5;
	this.predatorCount = args.predatorCount || 5;

}

Config.prototype = {
	set preyCount (value) {
		this._preyCount = Math.max(value, 0);
	},
	get preyCount () {
		return this._preyCount;
	},
	set predatorCount (value) {
		this._predatorCount = Math.max(value, 0);
	},
	get predatorCount () {
		return this._predatorCount;
	}

};