﻿using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace QCVOC.Server
{
    public static class Utility
    {
        #region Public Methods

        /// <summary>
        ///     Attempts to retrieve the value of the given <paramref name="settingName"/> from
        ///     <code>appsettings.json</code>, returning <see cref="string.Empty"/> if the setting could not be retrieved.
        /// </summary>
        /// <param name="settingName">The name of the setting to be retrieved.</param>
        /// <returns>The value of the retrieved <paramref name="settingName"/>.</returns>
        public static string GetAppSetting(string name)
        {
            var retVal = string.Empty;

            try
            {
                var config = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json").Build();

                retVal = config[name];
            }
            catch
            {
            }

            return retVal;
        }

        /// <summary>
        ///     Attempts to retrieve the value of the given <paramref name="settingName"/> from environment variables, returning
        ///     <see cref="string.Empty"/> if the setting could not be retrieved.
        /// </summary>
        /// <param name="settingName">The name of the setting to be retrieved.</param>
        /// <returns>The value of the retrieved <paramref name="settingName"/>.</returns>
        public static string GetEnvironmentVariable(string settingName)
        {
            var retVal = string.Empty;

            try
            {
                retVal = Environment.GetEnvironmentVariable(settingName);
            }
            catch
            {
            }

            return retVal;
        }

        /// <summary>
        ///     Attempts to retrieve the value of the given <paramref name="settingName"/>, first from environment variables, then
        ///     appsettings.json. Throws <see cref="InvalidOperationException"/> if the setting could not be retrieved.
        /// </summary>
        /// <typeparam name="T">The expected value <see cref="Type"/>.</typeparam>
        /// <param name="settingName">The name of the setting to be retrieved.</param>
        /// <returns>The value of the retrieved <paramref name="settingName"/> converted to the desired <see cref="Type"/><typeparamref name="T"/>.</returns>
        /// <exception cref="InvalidCastException"></exception>
        /// <exception cref="FormatException"></exception>
        /// <exception cref="OverflowException"></exception>
        /// <exception cref="ArgumentNullException"></exception>
        /// <exception cref="InvalidOperationException"></exception>
        public static T GetSetting<T>(string settingName)
        {
            var retVal = GetSetting<T>(settingName, default(T));

            if (retVal == null)
            {
                throw new InvalidOperationException("The specified setting could not be found, and no default value was given.  Check the configuration.");
            }

            return retVal;
        }

        /// <summary>
        ///     Attempts to retrieve the value of the given <paramref name="settingName"/>, first from environment variables, then
        ///     appsettings.json. Returns the given <paramref name="defaultValue"/> if the setting could not be retrieved.
        /// </summary>
        /// <typeparam name="T">The expected value <see cref="Type"/>.</typeparam>
        /// <param name="settingName">The name of the setting to be retrieved.</param>
        /// <param name="defaultValue">The default value to substitute if the setting could not be retrieved.</param>
        /// <returns>The value of the retrieved <paramref name="settingName"/> converted to the desired <see cref="Type"/><typeparamref name="T"/>.</returns>
        /// <exception cref="InvalidCastException"></exception>
        /// <exception cref="FormatException"></exception>
        /// <exception cref="OverflowException"></exception>
        /// <exception cref="ArgumentNullException"></exception>
        public static T GetSetting<T>(string settingName, T defaultValue)
        {
            if (string.IsNullOrEmpty(settingName))
            {
                throw new ArgumentNullException(settingName);
            }

            var retVal = GetEnvironmentVariable(settingName);

            if (string.IsNullOrEmpty(retVal))
            {
                retVal = GetAppSetting(settingName);
            }

            if (string.IsNullOrEmpty(retVal))
            {
                return defaultValue;
            }

            return (T)Convert.ChangeType(retVal, typeof(T));
        }

        #endregion Public Methods
    }
}