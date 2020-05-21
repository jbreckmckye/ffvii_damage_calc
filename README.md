# Final Fantasy VII Damage Calculator

https://www.breck-mckye.com/ffvii_damage_calc/

HTML/JS application to work out the damage caused by attacks in FFVII under a variety of situations.

This is a toy project from when I was first getting to grips with JavaScript. Though I think there were some good ideas (starting out with a MVW pattern; experimenting with OOCSS), there were some very bad ones too. Not least failing to use version control.

I'm pushing this to Github so I can use SCM whilst finishing it off so people can actually use the interface.

## What it has
- test physical, magical and curative attacks
- test with any combination of relevant attacker / defender stats
- test with any battle condition (Mini, back attack, hero drinks etc.)
- get a breakdown log of how the damage calculation proceeded
- see if and when damage overflow was triggered
- see random variation

## What it doesn't have yet
- unit tests, or a test interface
- ability to run mass calculations (eg for graphing relationships between stats and damage)

## What it probably won't ever have
- predefined scenarios (e.g. pick an enemy and have its stats autofill)
- mass calculation visualization

