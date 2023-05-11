const zoom = document.getElementById('zoom')
zoom.step = "8"
zoom.value = 40
if(JSON.parse(localStorage.getItem('but')) != null){
    document.getElementById("gatebuts").innerHTML = JSON.parse(localStorage.getItem('but'))
}
let wires = []
let blocks = []
let inputs = []
let outputs = []
let grid = []
let tgr = []
let rad = 10
let f = false
let s = false
let inp = false
let wdg = 40
let hig = wdg/2
let temp = []
let names = ['AND','NOT']
if(JSON.parse(localStorage.getItem('names')) != null){
    names = JSON.parse(localStorage.getItem('names'))
}
const inb = document.getElementById("inp")
const outb = document.getElementById("outp")
let gb = document.getElementById("gatebuts").childNodes
const create = document.getElementById("create")
const clear = document.getElementById("clear")
const txt = document.getElementById("txt")
let k = 'wire'
let t = ''
let adb = []
if(JSON.parse(localStorage.getItem('adb')) != null){
    adb = JSON.parse(localStorage.getItem('adb'))
}
let cut = false
let col = ['#9e0142','#d53e4f','#f46d43','#fdae61','#abdda4','#66c2a5','#3288bd','#5e4fa2']
txt.value = ''
const show = document.getElementById('show')
const popup = document.getElementById('popup')
const clos = document.getElementById('close')
const info = document.getElementById('info')
let slotsxy = []

if(!show.checked){
    popup.style.display = 'block'
}
else{
    popup.style.display = 'none'
}

function setblock(i,id){
    k = i
    t = id
    if(id == 'cut'){
        cut = true
    }
    else{
        cut = false
    }
    gb.forEach(el => {
        if(el.id != null){
            if(id == el.id){
                el.style.color = 'rgb(0, 210, 0)'
            }
            else{
                el.style.color = 'rgb(100,100,100)'
            }
        }
    });
}

function trash(id){
    let obj = document.getElementById(id)
    let markup = `<ion-icon name="trash-outline" class="but" style="font-size: large; position: relative; left: 0.4rem;" onclick="remblock('${id}')"></ion-icon>`
    let f = true
    obj.childNodes.forEach((e,i) => {
        if(e.name == "trash-outline"){
            f = false
        }
    });
    if(f){
        obj.insertAdjacentHTML('beforeend',markup)
    }
}

function remtrash(id){
    let obj = document.getElementById(id)
    obj.childNodes.forEach((e,i) => {
        if(e.name == "trash-outline"){
            obj.removeChild(obj.childNodes[i])
        }
    });
}

function remblock(id){
    let lst = document.getElementById(id)
    lst.parentNode.removeChild(lst);
    adb.forEach((e,i) => {
        if(e[0] == id){
            adb.splice(i,1)
        }
    });
    names.forEach((e,i) => {
        if(e == id){
            names.splice(i,1)
        }
    });
    let p = JSON.stringify(adb)
    let q = JSON.stringify(document.getElementById('gatebuts').innerHTML)
    let y = JSON.stringify(names)
    localStorage.setItem('adb',p)
    localStorage.setItem('but',q)
    localStorage.setItem('names',y)
}

class Wire{
    constructor(x,y){
        this.x = x
        this.y = y
        this.flag = true
        this.state = false
        this.b = []
    }
    make(){
        this.b.forEach((e,i) => {
            stroke(70)
            if(this.state){
                stroke(255,50,50)
            }
            strokeWeight(4)
            noFill()
            if(i > 0){
                arcGen(this.b[i - 1],e)
            }
            else{
                line(e[0],e[1],e[2],e[3])
            }
        });
    }
    update(){
        if(this.flag){
            grid.forEach(e => {
                let z = true
                if((this.b.length == 0 && abs(mouseX - e[0]) <= ((width - 200)/wdg)/2 && abs(mouseY - e[1]) <= ((height - 120)/hig)/2 && abs(this.x - e[0]) <= ((width - 200)/wdg)*2 && this.y == e[1]) || (abs(mouseX - e[0]) <= ((width - 200)/wdg)/2 && abs(mouseY - e[1]) <= ((height - 120)/hig)/2 && (abs(this.x - e[0]) == ((width - 200)/wdg) || abs(this.x - e[0]) == 0) && (abs(this.y - e[1]) == ((height - 120)/hig) || abs(this.y - e[1]) == 0))){
                    this.b.forEach(el => {
                        if(e[0] == el[0] && e[1] == el[1]){
                            z = false
                        }
                    });
                    if(z){
                        if((this.x != e[0] || this.y != e[1]) && (abs(this.x - e[0]) != (width - 200)/wdg || abs(this.y - e[1]) != (height - 120)/hig) && (tgr.includes(`${e[0]},${e[1]}`) == false || slotsxy.includes(`${e[0]},${e[1]}`) == true)){
                            this.b.push([this.x,this.y,e[0],e[1]])
                            this.x = e[0]
                            this.y = e[1]
                            console.log('REACHED');
                        }
                    }
                }
            });
        }
    }
    set(x,y){
        this.flag = false
        if(this.x != x || this.y != y){
            this.b.push([this.x,this.y,x,y])
        }
    }
}

class Block{
    constructor(x,y,sl,re,func,tv){
        this.x = x
        this.y = y
        this.slots = []
        this.res = []
        this.wdth = 1
        if(sl > 2 || re > 2){
            this.wdth = 2
        }
        for(let i = 0; i < sl; i++){
            this.slots.push(new Slot(this.x,this.y + i*(height - 120)/hig))
            slotsxy.push(`${this.x},${this.y + i*(height - 120)/hig}`)
        }
        for(let i = 0; i < re; i++){
            this.res.push(new Reslot(this.x + (((width - 200)/wdg) * this.wdth),this.y + i*(height - 120)/hig))
        }
        this.t = tv
        this.func = func
        if(func != 'NOT' && func != 'AND'){
            for(let j = 0; j < adb.length; j++){
                if(func == adb[j][0]){
                    this.func = []
                    for(let i = 0; i < adb[j][1].length; i++){
                        this.func.push(adb[j][1][i])
                    }
                }
            }
            this.func[1] = cr(this.func[1])
        }
        function cr(fnc){
            if(fnc != 'NOT' && fnc != 'AND'){
                fnc.forEach(e => {
                    let m = e[2]
                    if(m != 'NOT' && m != 'AND'){
                        for(let j = 0; j < adb.length; j++){
                            if(m == adb[j][0]){
                                m = []
                                for(let i = 0; i < adb[j][1].length; i++){
                                    m.push(adb[j][1][i])
                                }
                                e[2] = m
                            }
                        }
                        cr(m[1])
                    }
                });
                return fnc
            }
            else{
                return fnc
            }
        }

    }
    show(){
        fill(col[names.indexOf(this.t)%8])
        noStroke()
        rect(this.x,this.y - (50 / (wdg/8)),((width - 200)/wdg) * this.wdth,(this.slots.length - 1)*(height - 120)/hig + 2*(50 / (wdg/8)),(50 / (wdg/8)))
        // strokeWeight(4)
        fill(255)
        textSize(12 - ((zoom.value - 32)/8))
        if(this.wdth == 2)[
            textSize(10 * 1)
        ]
        textAlign(CENTER, CENTER)
        text(this.t,this.x + (((width - 200)/wdg) * this.wdth)/2,this.y + (this.slots.length - 1)*(height - 120)/hig/2)
        this.slots.forEach(el => {
            el.show()
            el.update()
        });
        this.res.forEach(el => {
            el.show()
            el.update()
        });
    }
    update(){
        let slt = []
        this.slots.forEach(e => {
            slt.push(e.state)
        });
        let rslt = creating(this.func,slt)
        this.res.forEach((e,i) => {
            e.state = rslt[0][i]
        });
        // this.funct = rslt[1]
        // console.log(this.func);
    }
}

class Slot{
    constructor(x,y){
        this.x = x
        this.y = y
        this.r = 80 / (wdg/8)
        this.wires = []
        this.state = false
    }
    show(){
        noStroke()
        fill(70)
        if(this.state){
            fill(255,50,50)
        }
        circle(this.x,this.y,this.r)
    } 
    update(){
        let c = 0
        if(this.wires.length > 0){
            this.wires.forEach(el => {
                if(el.state){
                    this.state = true
                }
                else{
                    c += 1
                }
            });
            if(c == this.wires.length){
                this.state = false
            }
        }
        else{
            this.state = false
        }
    }
}

class Reslot{
    constructor(x,y){
        this.x = x
        this.y = y
        this.r = 80 / (wdg/8)
        this.wires = []
        this.state = false
    }
    show(){
        noStroke()
        fill(70)
        if(this.state){
            fill(255,50,50)
        }
        circle(this.x,this.y,this.r)
    }
    update(){
        if(this.wires.length > 0){
            this.wires.forEach(el => {
                el.state = this.state
            });
        }
    }
}

class Input{
    constructor(x,y){
        this.x = x
        this.y = y
        this.r = 120 / (wdg/8)
        this.wires = []
        this.state = false
    }
    show(){
        noStroke()
        fill(70)
        if(this.state){
            fill(255,50,50)
        }
        circle(this.x,this.y,this.r)
    }
    switch(){
        if(this.state){
            this.state = false
        }
        else{
            this.state = true
        }
    }
    update(){
        if(this.wires.length > 0){
            this.wires.forEach(el => {
                el.state = this.state
                el.b[0][0] = this.x
                el.b[0][1] = this.y
            });
        }
    }
}

class Output{
    constructor(x,y){
        this.x = x
        this.y = y
        this.r = 120 / (wdg/8)
        this.wires = []
        this.state = false
    }
    show(){
        noStroke()
        fill(70)
        if(this.state){
            fill(255,50,50)
        }
        circle(this.x,this.y,this.r)
    }
    update(){
        if(this.wires.length > 0){
            let c = 0
            this.wires.forEach(el => {
                if(el.state){
                    this.state = true
                }
                else{
                    c += 1
                }
            });
            if(c == this.wires.length){
                this.state = false
            }
        }
    }
}

function setup(){
    createCanvas(1520,690)
    for(let i = 0; i < wdg; i++){
        for(let j = 0; j < hig; j++){
            grid.push([i*((width - 200)/wdg) + 120,j*((height - 120)/hig) + 40])
        }
    }
    inputs.push(new Input(grid[0][0] - 2*((width - 200)/wdg),grid[0][1]))
    outputs.push(new Output(grid[grid.length - 1][0] + 2*((width - 200)/wdg),grid[0][1]))
}

function draw(){
    background(0)
    noFill()
    stroke(40)
    strokeWeight(2)
    rect(grid[0][0] - ((width - 200)/wdg) + 10,grid[0][1] - ((width - 200)/wdg) + 10,grid[grid.length - 1][0] - grid[0][0] + 2*((width - 200)/wdg) - 20,grid[grid.length - 1][1] - grid[0][1] + 2*((width - 200)/wdg) - 20,10)
    grid.forEach(el => {
        noStroke()
        fill(30)
        circle(el[0],el[1],4)
    });
    wires.forEach(el => {
        el.update()
        el.make()
    });
    blocks.forEach(el => {
        el.show()
        el.update()
    });
    inputs.forEach(el => {
        el.show()
        el.update()
    });
    outputs.forEach(el => {
        el.show()
        el.update()
    });
    if(wires.length == 0 && blocks.length == 0){
        zoom.style.display = "flex"
    }
    else{
        zoom.style.display = "none"
    }
}

function mousePressed(){
    temp = []
    s = false 
    let x = null;
    let y = null;
    grid.forEach(e => {
        if(abs(mouseX - e[0]) <= ((width - 200)/wdg)/2 && abs(mouseY - e[1]) <= ((height - 120)/hig)/2){
            x = e[0]
            y = e[1]
        }
    });
    if(!cut){
        if(k != 'wire'){
            if(x != null && y != null){
                let wdth = 1
                let app = true
                if(k[0] > 2 || k[1] > 2){
                    wdth = 2
                }
                let mnm = Math.max(k[0],k[1])
                for(let i = 0; i < mnm; i++){
                    if(tgr.includes(`${x},${y + i*(height - 120)/hig}`) == true || x > grid[grid.length - 1][0] || x < grid[0][0] || (y + i*(height - 120)/hig) > grid[grid.length - 1][1] || (y + i*(height - 120)/hig) < grid[0][1]){
                        app = false
                    }
                }
                for(let i = 0; i < mnm; i++){
                    for(let j = 1; j < wdth + 1; j++){
                        if(tgr.includes(`${x + (((width - 200)/wdg) * j)},${y + i*(height - 120)/hig}`) == true || (x + (((width - 200)/wdg) * j)) > grid[grid.length - 1][0] || (x + (((width - 200)/wdg) * j)) < grid[0][0] || (y + i*(height - 120)/hig) > grid[grid.length - 1][1] || (y + i*(height - 120)/hig) < grid[0][1]){
                            app = false
                        }
                    }
                }
                if(app){
                    for(let i = 0; i < mnm; i++){
                        tgr.push(`${x},${y + i*(height - 120)/hig}`)
                    }
                    for(let i = 0; i < mnm; i++){
                        for(let j = 1; j < wdth + 1; j++){
                            tgr.push(`${x + (((width - 200)/wdg) * j)},${y + i*(height - 120)/hig}`)
                        }
                    }
                    blocks.push(new Block(x,y,k[0],k[1],k[2],t))
                }
            }
        }
        else{
            blocks.forEach((el,i) => {
                el.res.forEach((e,j) => {
                    if(mouseX > e.x - (e.r)/2 && mouseX < e.x + (e.r)/2 && mouseY > e.y - (e.r)/2 && mouseY < e.y + (e.r)/2){
                        wires.push(new Wire(e.x,e.y))
                        temp = [i,j]
                        f = true
                    }
                });
            });
            inputs.forEach((el,i) => {
                if(mouseX > el.x - (el.r)/2 && mouseX < el.x + (el.r)/2 && mouseY > el.y - (el.r)/2 && mouseY < el.y + (el.r)/2){
                    wires.push(new Wire(el.x,el.y))
                    el.switch()
                    inp = true
                    temp = [i]
                    f = true
                }
            });
        }
    }
    else{
        if(x != null && y != null){
            let sar = []
            wires.forEach((e,i) => {
                e.b.forEach(el => {
                    if(((x == el[0] && y == el[1]) || (x == el[2] && y == el[3])) && sar.includes(i) == false){
                        sar.push(i)
                    }
                });
            });
            for(let i = 0; i < sar.length; i++){
                wires[sar[i]].state = false
                wires.splice(sar[i],1)
            }
            sar = []
            blocks.forEach(elem => {
                elem.slots.forEach(e => {
                    e.wires.forEach((el,i) => {
                        el.b.forEach(ele => {
                            if(((x == ele[0] && y == ele[1]) || (x == ele[2] && y == ele[3])) && sar.includes(i) == false){
                                sar.push(i)
                            }
                        });
                    });
                    for(let i = 0; i < sar.length; i++){
                        e.wires[sar[i]].state = false
                        e.wires.splice(sar[i],1)
                    }
                    sar = []
                });
                elem.res.forEach(e => {
                    e.wires.forEach((el,i) => {
                        el.b.forEach(ele => {
                            if(((x == ele[0] && y == ele[1]) || (x == ele[2] && y == ele[3])) && sar.includes(i) == false){
                                sar.push(i)
                            }
                        });
                    });
                    for(let i = 0; i < sar.length; i++){
                        e.wires.splice(sar[i],1)
                    }
                    sar = []
                });
            });
            inputs.forEach(e => {
                e.wires.forEach((el,i) => {
                    el.b.forEach(ele => {
                        if(((x == ele[0] && y == ele[1]) || (x == ele[2] && y == ele[3])) && sar.includes(i) == false){
                            sar.push(i)
                        }
                    });
                });
                for(let i = 0; i < sar.length; i++){
                    e.wires.splice(sar[i],1)
                }
                sar = []
            });
            outputs.forEach(e => {
                e.wires.forEach((el,i) => {
                    el.b.forEach(ele => {
                        if(((x == ele[0] && y == ele[1]) || (x == ele[2] && y == ele[3])) && sar.includes(i) == false){
                            sar.push(i)
                        }
                    });
                });
                for(let i = 0; i < sar.length; i++){
                    e.wires.splice(sar[i],1)
                }
                sar = []
            });
        }
    }
}

function mouseReleased(){
    if(f){
        let x = null;
        let y = null;
        grid.forEach(e => {
            if(abs(mouseX - e[0]) <= ((width - 200)/wdg)/2 && abs(mouseY - e[1]) <= ((height - 120)/hig)/2){
                x = e[0]
                y = e[1]
            }
        });
        blocks.forEach(el => {
            el.slots.forEach(e => {
                if(x != null && y != null){
                    if(wires[wires.length - 1].b.length > 0 && wires[wires.length - 1].b[wires[wires.length - 1].b.length - 1][2] ==  e.x && wires[wires.length - 1].b[wires[wires.length - 1].b.length - 1][3] == e.y){
                        wires[wires.length - 1].set(e.x,e.y)
                        s = true
                        e.wires.push(wires[wires.length - 1])
                        if(!inp){
                            blocks[temp[0]].res[temp[1]].wires.push(wires[wires.length - 1])
                        }
                        else{
                            inputs[temp[0]].wires.push(wires[wires.length - 1])
                            inp = false
                        }
                    }
                }
            });
        });
        outputs.forEach((el) => {
            if(mouseX > el.x - (el.r)/2 && mouseX < el.x + (el.r)/2 && mouseY > el.y - (el.r)/2 && mouseY < el.y + (el.r)/2 && abs(el.x - wires[wires.length - 1].x) == ((width - 200)/wdg)*2 && el.y == wires[wires.length - 1].y){
                wires[wires.length - 1].set(el.x,el.y)
                s = true
                el.wires.push(wires[wires.length - 1])
                if(!inp){
                    blocks[temp[0]].res[temp[1]].wires.push(wires[wires.length - 1])
                }
                else{
                    inputs[temp[0]].wires.push(wires[wires.length - 1])
                    inp = false
                }
            }
        });
        if(s == false){
            wires.pop()
        }
        f = false
    }
}

function arcGen(a,b){
    if(a[0] == a[2] && a[1] - a[3] > 0){   //UP
        if(b[2] - b[0] > 0){    //RIGHT
            angleMode(DEGREES)
            arc(b[0] + rad, b[1] + rad,rad * 2,rad * 2,180,270)
            a[3] = a[1] - (height - 120)/hig + rad
            line(b[0] + rad,b[1],b[2],b[3])
        }
        else if(b[2] - b[0] < 0){    //LEFT
            angleMode(DEGREES)
            arc(b[0] - rad, b[1] + rad,rad * 2,rad * 2,270,0)
            a[3] = a[1] - (height - 120)/hig + rad
            line(b[0] - rad,b[1],b[2],b[3])
        }
        else if(b[2] == b[0]){
            line(b[0],b[1],b[2],b[3])
        }
    }
    else if(a[0] == a[2] && a[1] - a[3] < 0){   //DOWN
        if(b[2] - b[0] > 0){    //RIGHT
            angleMode(DEGREES)
            arc(b[0] + rad, b[1] - rad,rad * 2,rad * 2,90,180)
            a[3] = a[1] + (height - 120)/hig - rad
            line(b[0] + rad,b[1],b[2],b[3])
        }
        else if(b[2] - b[0] < 0){    //LEFT
            angleMode(DEGREES)
            arc(b[0] - rad, b[1] - rad,rad * 2,rad * 2,0,90)
            a[3] = a[1] + (height - 120)/hig - rad
            line(b[0] - rad,b[1],b[2],b[3])
        }
        else if(b[2] == b[0]){
            line(b[0],b[1],b[2],b[3])
        }
    }
    else if(a[1] == a[3] && a[2] - a[0] < 0){   //LEFT
        if(b[3] - b[1] < 0){    //UP
            angleMode(DEGREES)
            arc(b[0] + rad, b[1] - rad,rad * 2,rad * 2,90,180)
            a[2] = a[0] - (width - 200)/wdg + rad
            line(b[0],b[1] - rad,b[2],b[3])
        }
        else if(b[3] - b[1] > 0){    //DOWN
            angleMode(DEGREES)
            arc(b[0] + rad, b[1] + rad,rad * 2,rad * 2,180,270)
            a[2] = a[0] - (width - 200)/wdg + rad
            line(b[0] ,b[1] + rad,b[2],b[3])
        }
        else if(b[3] == b[1]){
            line(b[0],b[1],b[2],b[3])
        }
    }
    else if(a[1] == a[3] && a[2] - a[0] > 0){   //RIGHT
        if(b[3] - b[1] < 0){    //UP
            angleMode(DEGREES)
            arc(b[0] - rad, b[1] - rad,rad * 2,rad * 2,0,90)
            if(a[0] < grid[0][0]){
                a[2] = a[0] + 2*(width - 200)/wdg - rad
            }
            else{
                a[2] = a[0] + (width - 200)/wdg - rad
            }
            line(b[0],b[1] - rad,b[2],b[3])
        }
        else if(b[3] - b[1] > 0){    //DOWN
            angleMode(DEGREES)
            arc(b[0] - rad, b[1] + rad,rad * 2,rad * 2,270,0)
            if(a[0] < grid[0][0]){
                a[2] = a[0] + 2*(width - 200)/wdg - rad
            }
            else{
                a[2] = a[0] + (width - 200)/wdg - rad
            }
            line(b[0] ,b[1] + rad,b[2],b[3])
        }
        else if(b[3] == b[1]){
            line(b[0],b[1],b[2],b[3])
        }
    }
}

function creating(func,slots){
    if(func == 'AND'){
        if(slots[0] && slots[1]){
            return [[true],func]
        }
        else{
            return [[false],func]
        }
    }
    else if(func == 'NOT'){
        if(slots[0]){
            return [[false],func]
        }
        else{
            return [[true],func]
        }
    }
    else{
        let ind = null;
        func[2].forEach((e,i) => {
            e.forEach(el => {
                    func[0][el] = slots[i]
                });
            });
        func[1].forEach(e => {
            let ed = []
            e[1].forEach((el,i) => {
                let c = false
                el.forEach(ele => {
                    if(func[0][ele] == true){
                        ed[i] = true
                        c = true
                    }
                });
                if(c == false){
                    ed[i] == false
                }
            });
            let m = e[2]
            let reslt = creating(m,ed)
            e[0].forEach((el,i) => {
                el.forEach(ele => {
                    func[0][ele] = reslt[0][i]
                });
            });
        });
        let outputt = []
        func[3].forEach(el => {
            let c = false
            el.forEach(ele => {
                if(func[0][ele] == true){
                    outputt.push(true)
                    c = true
                }
            });
            if(c == false){
                outputt.push(false)
            }
        });
        let resal = [outputt,func]
        adb = JSON.parse(localStorage.getItem('adb'))
        return resal
    }
}

inb.addEventListener('click',() => {
    if(inputs.length < hig){
        inputs.push(new Input(grid[0][0] - 2*((width - 200)/wdg),inputs.length * (height - 120)/hig + 40))
    }
})

outb.addEventListener('click',() => {
    if(outputs.length < hig){
        outputs.push(new Output(grid[grid.length - 1][0] + 2*((width - 200)/wdg),outputs.length * (height - 120)/hig + 40))
    }
})

create.addEventListener('click',() => {
    if(names.includes(txt.value) == false && txt.value.length <= 5 && txt.value.length > 0){
        names.push(txt.value)
        let wr = []
        let inps = []
        let outps = []
        let blcks = []
        wires.forEach(e => {
            wr.push(e.state)
        });
        inputs.forEach(e => {
            let inwrs = []
            e.wires.forEach(ele => {
                inwrs.push(wires.indexOf(ele))
            });
            inps.push(inwrs)
        });
        outputs.forEach(e => {
            let outwrs = []
            e.wires.forEach(ele => {
                outwrs.push(wires.indexOf(ele))
            });
            outps.push(outwrs)
        });
        blocks.forEach(e => {
            let rsltwrs = []
            let rswrs = []
            let slts = []
            let sltwrs = []
            let slwrs = []
            e.res.forEach(el => {
                rswrs = []
                el.wires.forEach(ele => {
                    rswrs.push(wires.indexOf(ele))
                });
                rsltwrs.push(rswrs)
            });
            e.slots.forEach(el => {
                slwrs = []
                slts.push(el.state)
                el.wires.forEach(ele => {
                    slwrs.push(wires.indexOf(ele))
                });
                sltwrs.push(slwrs)
            });
            blcks.push([rsltwrs,sltwrs,e.func])
        });
        adb.push([txt.value,[wr,blcks,inps,outps]])
        wr = []
        blcks = []
        inps = []
        outps = []
        console.log(adb);
        const markup = 
        `
        <div class="gate" id="${txt.value}"  onclick="setblock([${inputs.length},${outputs.length},'${txt.value}'],'${txt.value}')" onmouseover="trash('${txt.value}')" onmouseleave="remtrash('${txt.value}')">
            <span>${txt.value}</span>
        </div>
        `
        document.getElementById('gatebuts').insertAdjacentHTML("beforeend",markup)
        wires = []
        blocks = []
        inputs = []
        outputs = []
        tgr = []
        inputs.push(new Input(grid[0][0] - 2*((width - 200)/wdg),grid[0][1]))
        outputs.push(new Output(grid[grid.length - 1][0] + 2*((width - 200)/wdg),grid[0][1]))
        gb = document.getElementById("gatebuts").childNodes
        txt.value = ''
        console.log(gb);
        let p = JSON.stringify(adb)
        let q = JSON.stringify(document.getElementById('gatebuts').innerHTML)
        let y = JSON.stringify(names)
        localStorage.setItem('adb',p)
        localStorage.setItem('but',q)
        localStorage.setItem('names',y)
    }
})

clear.addEventListener('click',() => {
    wires = []
    blocks = []
    inputs = []
    outputs = []
    tgr = []
    inputs.push(new Input(grid[0][0] - 2*((width - 200)/wdg),grid[0][1]))
    outputs.push(new Output(grid[grid.length - 1][0] + 2*((width - 200)/wdg),grid[0][1]))
})

txt.addEventListener('change',() => {
    txt.value = txt.value.toUpperCase()
})

zoom.addEventListener('change',() => {
    if(zoom.value%8 == 0){
        wdg = zoom.value
        hig = wdg/2
    }
    grid = []
    for(let i = 0; i < wdg; i++){
        for(let j = 0; j < hig; j++){
            grid.push([i*((width - 200)/wdg) + 120,j*((height - 120)/hig) + 40])
        }
    }
    inputs.forEach((e,i) => {
        e.x = grid[0][0] - 2*((width - 200)/wdg)
        e.y = i * ((height - 120)/hig) + grid[0][1]
        e.r = 120 / (wdg/8)
    });
    outputs.forEach((e,i) => {
        e.x = grid[grid.length - 1][0] + 2*((width - 200)/wdg)
        e.y = i * ((height - 120)/hig) + grid[0][1]
        e.r = 120 / (wdg/8)
    });
    blocks.forEach(el => {
        el.slots.forEach(e => {
            e.r = 60 / (wdg/8)
        });
        el.res.forEach(e => {
            e.r = 60 / (wdg/8)
        });
    });
})

clos.addEventListener('click',()=>{
    popup.style.display = 'none'
})

info.addEventListener('click',()=>{
    popup.style.display = 'block'
})