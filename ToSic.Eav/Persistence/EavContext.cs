﻿using System;
using System.Collections.Generic;
using System.Linq;
using ToSic.Eav.Data;
using ToSic.Eav.Import;
using ToSic.Eav.Persistence;

namespace ToSic.Eav
{
	public partial class EavContext
    {
        #region Extracted, now externalized objects with actions

	    private DbShortcuts _dbs;

	    public DbShortcuts DbS
	    {
	        get
	        {
	            if(_dbs == null)
                    _dbs = new DbShortcuts(this);
	            return _dbs;
	        }
	    }

        public DbVersioning Versioning { get; private set; }
        public DbEntityCommands EntCommands { get; private set; }
        public DbValueCommands ValCommands { get; private set; }
        public DbAttributeCommands AttrCommands { get; private set; }
        public DbRelationshipCommands RelCommands { get; private set; }
        public DbAttributeSetCommands AttSetCommands { get; private set; }
        public DbPublishing PubCommands { get; private set; }

	    #endregion

		#region Private Fields
		public int _appId;
		internal int _zoneId;
		/// <summary>caches all AttributeSets for each App</summary>
		internal readonly Dictionary<int, Dictionary<int, IContentType>> _contentTypes = new Dictionary<int, Dictionary<int, IContentType>>();
		/// <summary>SaveChanges() assigns all Changes to this ChangeLog</summary>
		#endregion

		#region Properties like AppId, ZoneId, UserName etc.
		/// <summary>
		/// AppId of this whole Context
		/// </summary>
		public int AppId
		{
            get { return _appId == 0 ? Constants.MetaDataAppId : _appId; }
			set { _appId = value; }
		}

		/// <summary>
		/// ZoneId of this whole Context
		/// </summary>
		public int ZoneId
		{
            get { return _zoneId == 0 ? Constants.DefaultZoneId : _zoneId; }
			set { _zoneId = value; }
		}

		/// <summary>
		/// Current UserName. Used for ChangeLog
		/// </summary>
		public string UserName { get; set; }

		/// <summary>
		/// Get or seth whether SaveChanges() should automatically purge cache.
		/// </summary>
		/// <remarks>Usefull if many changes are made in a batch and Cache should be purged after that batch</remarks>
        internal bool PurgeAppCacheOnSavex = true;

	    public bool PurgeAppCacheOnSave
		{
			get { return PurgeAppCacheOnSavex; }
			set { PurgeAppCacheOnSavex = value; }
		}
		#endregion

		#region Constructor and Init
		/// <summary>
		/// Returns a new instace of the Eav Context. InitZoneApp must be called afterward.
		/// </summary>
		private static EavContext Instance()
		{
			var connectionString = Configuration.GetConnectionString();
			var x = new EavContext(connectionString);
            x.Versioning = new DbVersioning(x);
            x.EntCommands = new DbEntityCommands(x);
            x.ValCommands = new DbValueCommands(x);
            x.AttrCommands = new DbAttributeCommands(x);
            x.RelCommands = new DbRelationshipCommands(x);
            x.AttSetCommands = new DbAttributeSetCommands(x);
            x.PubCommands = new DbPublishing(x);
		    return x;
		}

		/// <summary>
		/// Returns a new instace of the Eav Context on specified ZoneId and/or AppId
		/// </summary>
		public static EavContext Instance(int? zoneId = null, int? appId = null)
		{
			var context = Instance();
			context.InitZoneApp(zoneId, appId);

			return context;
		}

		/// <summary>
		/// Set ZoneId and AppId on current context.
		/// </summary>
		public void InitZoneApp(int? zoneId = null, int? appId = null)
		{
			if (zoneId.HasValue)
				_zoneId = zoneId.Value;
			else
			{
				if (appId.HasValue)
				{
					var zoneIdOfApp = Apps.Where(a => a.AppID == appId.Value).Select(a => (int?)a.ZoneID).SingleOrDefault();
					if (!zoneIdOfApp.HasValue)
						throw new ArgumentException("App with id " + appId.Value + " doesn't exist.", "appId");
					_zoneId = zoneIdOfApp.Value;
				}
				else
				{
                    _zoneId = Constants.DefaultZoneId;
                    _appId = Constants.MetaDataAppId;
					return;
				}
			}

			var zone = ((DataSources.Caches.BaseCache)DataSource.GetCache(_zoneId, null)).ZoneApps[_zoneId];

			if (appId.HasValue)
			{
				// Set AppId and validate AppId exists with specified ZoneId
				var foundAppId = zone.Apps.Where(a => a.Key == appId.Value).Select(a => (int?)a.Key).SingleOrDefault();
				if (!foundAppId.HasValue)
					throw new ArgumentException("App with id " + appId.Value + " doesn't exist.", "appId");
				_appId = foundAppId.Value;
			}
			else
				_appId = zone.Apps.Where(a => a.Value == Constants.DefaultAppName).Select(a => a.Key).Single();

		}

		#endregion



        #region Save and check if to kill cache

        /// <summary>
		/// Persists all updates to the data source and optionally resets change tracking in the object context.
		/// Also Creates an initial ChangeLog (used by SQL Server for Auditing).
		/// If items were modified, Cache is purged on current Zone/App
		/// </summary>
		public override int SaveChanges(System.Data.Objects.SaveOptions options)
		{
			if (_appId == 0)
				throw new Exception("SaveChanges with AppId 0 not allowed.");

			// enure changelog exists and is set to SQL CONTEXT_INFO variable
			if (Versioning.MainChangeLogId == 0)
                Versioning.GetChangeLogId(UserName);

			var modifiedItems = base.SaveChanges(options);

			if (modifiedItems != 0 && PurgeAppCacheOnSave)
				DataSource.GetCache(ZoneId, AppId).PurgeCache(ZoneId, AppId);

			return modifiedItems;
		}

		#endregion



	}

}