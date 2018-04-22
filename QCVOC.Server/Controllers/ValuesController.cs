﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QCVOC.Server.Data.Model;

namespace QCVOC.Server.Controllers
{
    [Authorize(Roles = nameof(Role.Administrator))]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class ValuesController : Controller
    {
        // GET: api/Values
        [HttpGet]
        public ActionResult Get()
        {
            return Ok(new string[] { "value1", "value2" });
        }
    }
}
