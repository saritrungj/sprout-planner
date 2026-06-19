import json
from datetime import date, timedelta
from playwright.sync_api import sync_playwright
KEY="sprout-planner:v1"
today=date.today(); month=today.strftime("%Y-%m")
tasks={
 "t1":{"id":"t1","title":"Morning meditation","createdAt":"2026-06-01T00:00:00Z","slot":"morning"},
 "t2":{"id":"t2","title":"20 min workout","createdAt":"2026-06-01T00:00:00Z","slot":"afternoon"},
 "t3":{"id":"t3","title":"Read 10 pages","createdAt":"2026-06-01T00:00:00Z","slot":"evening"},
 "t4":{"id":"t4","title":"Drink 2L water","createdAt":"2026-06-01T00:00:00Z"},
}
days={}
for i in range(1,10):
    d=(today-timedelta(days=i)).isoformat()
    days[d]={"date":d,"done":{"t1":True,"t2":True,"t3":True,"t4":True},"addonTaskIds":[]}
days[today.isoformat()]={"date":today.isoformat(),"done":{"t1":True,"t4":True},"addonTaskIds":[]}
def mk(theme,zen):
    return {"tasks":tasks,"months":{month:{"month":month,"mainTaskIds":["t1","t2","t3","t4"]}},
            "days":days,"settings":{"theme":theme,"language":"en","zenMode":zen,"mascot":"streak",
            "reminders":{"enabled":False,"time":"20:00"}}}

with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    def load(vp, st):
        pg=b.new_page(viewport=vp)
        pg.goto("http://localhost:5199")
        pg.evaluate("([k,v])=>localStorage.setItem(k,v)",[KEY,json.dumps(st)])
        pg.reload(); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(3200)
        return pg
    def click_side(pg,name): pg.locator("nav.w-72").get_by_role("button",name=name).click(); pg.wait_for_timeout(700)
    def click_bottom(pg,name): pg.locator("nav.bottom-0").get_by_role("button",name=name).click(); pg.wait_for_timeout(700)

    # Desktop
    pg=load({"width":1440,"height":900}, mk("light",False))
    pg.screenshot(path="/tmp/v2_today_desktop.png")
    click_side(pg,"Settings"); pg.screenshot(path="/tmp/v2_settings_desktop.png", full_page=True)
    click_side(pg,"Dashboard"); pg.screenshot(path="/tmp/v2_dash_desktop.png", full_page=True)
    click_side(pg,"Calendar"); pg.screenshot(path="/tmp/v2_cal_desktop.png", full_page=True)
    pg.close()
    # Desktop tasks section (scroll) to see slot grouping
    pg=load({"width":1440,"height":900}, mk("light",False))
    pg.evaluate("document.getElementById('today-tasks')?.scrollIntoView()"); pg.wait_for_timeout(600)
    pg.screenshot(path="/tmp/v2_today_tasks_desktop.png")
    pg.close()
    # Zen mode desktop
    pg=load({"width":1440,"height":900}, mk("light",True))
    pg.screenshot(path="/tmp/v2_today_zen.png")
    pg.close()
    # Mobile
    pg=load({"width":390,"height":844}, mk("light",False))
    pg.screenshot(path="/tmp/v2_today_mobile.png")
    click_bottom(pg,"Settings"); pg.wait_for_timeout(400); pg.screenshot(path="/tmp/v2_settings_mobile.png", full_page=True)
    pg.close()
    # Mobile dark dashboard
    pg=load({"width":390,"height":844}, mk("dark",False))
    click_bottom(pg,"Dashboard"); pg.screenshot(path="/tmp/v2_dash_mobile_dark.png", full_page=True)
    pg.close()
    b.close()
    print("done")
