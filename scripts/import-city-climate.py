import json, urllib.request, calendar, concurrent.futures, pathlib, datetime, time, argparse
root=pathlib.Path(__file__).resolve().parent.parent
rows=[('Bangkok',764,13.7563,100.5018),('Hong Kong',156,22.3193,114.1694),('London',826,51.5074,-.1278),('Macao',156,22.1987,113.5439),('Istanbul',792,41.0082,28.9784),('Dubai',784,25.2048,55.2708),('Mecca',682,21.3891,39.8579),('Antalya',792,36.8969,30.7133),('Paris',250,48.8566,2.3522),('Kuala Lumpur',458,3.139,101.6869),('Osaka',392,34.6937,135.5023),('Singapore',702,1.3521,103.8198),('Seoul',410,37.5665,126.978),('Tokyo',392,35.6762,139.6503),('New York',840,40.7128,-74.006),('Rome',380,41.9028,12.4964),('Phuket',764,7.8804,98.3923),('Barcelona',724,41.3874,2.1686),('Amsterdam',528,52.3676,4.9041),('Taipei',158,25.033,121.5654)]
cache=pathlib.Path('/tmp/gowhere-climate-cache');cache.mkdir(exist_ok=True)
def load(row):
 name,iso,lat,lng=row
 url=f'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,PRECTOTCORR&community=AG&longitude={lng}&latitude={lat}&start=20010101&end=20201231&format=JSON'
 path=cache/(name.replace(' ','-')+'.json')
 if not path.exists():
  for attempt in range(3):
   try:
    with urllib.request.urlopen(url,timeout=90) as r: raw=r.read()
    json.loads(raw);path.write_bytes(raw);break
   except Exception:
    if attempt==2: raise
    time.sleep(2)
 raw=json.loads(path.read_text());p=raw['properties']['parameter'];out=dict(name=name,iso=iso,lat=lat,lng=lng)
 for field,param in [('hi','T2M_MAX'),('lo','T2M_MIN'),('pr','PRECTOTCORR')]:
  values=[]
  for m in range(1,13):
   expected=sum(calendar.monthrange(y,m)[1] for y in range(2001,2021))
   v=[v for d,v in p[param].items() if len(d)==8 and int(d[4:6])==m and v!=-999]
   assert len(v)==expected,(name,param,m,len(v),expected)
   values.append(round(sum(v)/(20 if field=='pr' else len(v)),1))
  out[field]=values
 out['source']={'provider':'NASA POWER / MERRA-2','period':'2001-2020','url':url,'method':'Monthly mean of daily highs and lows; mean monthly precipitation total across 20 complete years. Gridded reanalysis, not a city weather station.','retrieved':datetime.date.today().isoformat()}
 print('Imported '+name,flush=True);return out
if __name__ == '__main__':
 parser=argparse.ArgumentParser(description='Import complete 2001-2020 daily climate averages.')
 parser.add_argument('--input',type=pathlib.Path,help='JSON list of name, iso, lat, lng objects')
 parser.add_argument('--output',type=pathlib.Path,default=root/'climate/top-cities.json')
 args=parser.parse_args()
 if args.input:
  rows=[(r['name'],r['iso'],r['lat'],r['lng']) for r in json.loads(args.input.read_text())]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: result=list(pool.map(load,rows))
 args.output.write_text(json.dumps(result,indent=2)+'\n')
