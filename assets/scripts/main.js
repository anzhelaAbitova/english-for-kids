'use strict'

import cards from './cards.js';
import categories from './categories.js';
import Card from './card.js';
import Category from './category.js';
import Router from './router.js';
import Stars from './stars.js';
import { playSound, getDescendant, randomArr, makeElem } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    new App(
        'train',
        document.querySelector('.container'),
        document.querySelector(".menu_burger"),
        document.querySelector(".menu"),
        document.querySelector('.screen'),
        document.querySelector('#switch_toggle'),
        document.querySelector('#switch_toggle-label')
    );
})


class App {
    pageObj = {
        page: 'animal-a',
        get a() {
            return this.page;
        },
        set c(val) {
            this.page = val;
        }
    }

    constructor( mode, container, menuBurgerBtn, menu, screen, toggleSwitch, toggleSwitchLabel ) {
        this.mode = mode;
        this.container = container;
        this.menuBurgerBtn = menuBurgerBtn;
        this.menu = menu;
        this.screen = screen;
        this.toggleSwitch = toggleSwitch;
        this.toggleSwitchLabel = toggleSwitchLabel;

        this.fail = false;
        this.linkRouter = null;
        this.stars = null;
        this.mark = 1;
        this.audiosPlay = [];
        this.word = '';
        this.cardsPlay = [];
        this.mixedAudios = [];
        this.audiosPlayControls = [];

        Object.defineProperty(this, "data", {
            get() {
                const actualData = someExpensiveComputation();
 
                Object.defineProperty(this, "data", {
                    value: actualData,
                    writable: false,
                    configurable: false
                });
 
                return actualData;
            },
            configurable: true,
            enumerable: true
        });

        this.init();
    }
    init() {
        this.linkRouter = new Router();
        this.pageScreen(this.linkRouter);

        let $links = document.querySelectorAll('.menu-el a');
        $links.forEach((link) => {
            link.addEventListener('click', this.handleMakeLink.bind(this));
        })
        this.toggleSwitch.addEventListener('input', this.handleSwitchMode.bind(this));
        this.menuBurgerBtn.addEventListener('click', this.handleMenu.bind(this));
        this.screen.addEventListener('click', this.handleMenu.bind(this));
    }

    pageScreen(linkRouter) {
        if (this.pageObj.page === 'animal-a') {
            this.makeMain(linkRouter);
        } else {
            let index = categories.findIndex((el) => el.name === this.pageObj.page);
            this.makeCategoryPage(index > 0 ? index : 0);
        }
    }

    handleMakeLink(event) {
        let route = event.target.getAttribute('data-index');
        (route === '-1') ? this.makeMain(this.linkRouter) : this.makeCategoryPage(+route + 1);

        this.linkRouter.nav(event);
    }

    handleSwitchMode(event) {
        console.log(event.target.checked)
        this.mode = (this.mode === 'train') ? 'play' : 'train';
        this.toggleSwitchLabel.innerHTML = this.mode;
        this.toggleSwitchLabel.style.paddingRight = (this.mode === 'train') ? '1rem' : '3.5rem';
        if (this.mode === 'play') {
            if (!this.menu.classList.contains('menu-play')) {
                this.menu.classList.add('menu-play');
            }
        } else {
            this.menu.classList.remove('menu-play');
        }
        this.pageScreen(this.linkRouter);
        return this.mode;
    }

    handleMenu(event) {
        this.menu.hidden = this.menuBurgerBtn.classList.contains('menu-burger-rotate');
        this.menu.classList.toggle('menu-open');
        this.menu.classList.toggle('menu-close');
        this.menuBurgerBtn.classList.toggle('menu-burger-rotate');

        if (!document.querySelector(".fade-on")) {
            this.screen.classList.add('fade-on');
        } else {
            this.screen.classList.remove('fade-on');
        }
    }

    handleCategory(...args) {
        this.linkRouter.nav(args[1]);
        this.makeCategoryPage(args[0] + 1);
    }

    handleCard(event) {
        if (event.target.getAttribute('data-route') === this.word) {
            event.target.add('checked_card');
            let $starsCNR = this.stars.makeStar(this.mark);
            this.mark++;
            this.container.before($starsCNR);
            playSound();
        } else {
            this.fail = true;
            playSound($errSound);
        }
        if (this.mixedAudios.length === 0) {
            this.container.innerHTML = '';
            if (!this.fail) {
                this.container.appendChild($finalImgW);
                this.container.appendChild($succSound);
                playSound($succSound);
                setTimeout(() => {
                    this.mode = 'train';
                    this.init();
                }, 8000);
            } else {
                this.container.appendChild($finalImgF);
                this.container.appendChild($failSound);
                playSound($failSound);
                setTimeout(() => {
                    this.mode = 'train';
                    this.init();
                }, 8000);
            }
        }
    }

    makeAudioPlayControls() {
        let $errSound = makeElem('audio');
        const audioSrc = ( name ) => `assets/audio/${name}.mp3`;

        $errSound.src = audioSrc('error');
        $errSound.id = `error-audio`;
        let $corrSound = makeElem('audio');
        $corrSound.src = audioSrc('correct');
        $corrSound.id = `correct-audio`;
        let $failSound = makeElem('audio');
        $failSound.src = audioSrc('failure');
        $failSound.id = `failure-audio`;
        let $succSound = makeElem('audio');
        $succSound.src = audioSrc('success');
        $succSound.id = `success-audio`;

        this.container.appendChild($errSound);
        this.container.appendChild($corrSound);
        this.container.appendChild($failSound);
        this.container.appendChild($succSound);
    }

    makePlay(cardItems) {
        let $finalImgW = makeElem('img', 'final-img');
        $finalImgW.src = 'assets/img/success.jpg';
        $finalImgW.setAttribute('alt', 'success');
        let $finalImgF = $finalImgW.cloneNode(true);
        $finalImgF.src = 'assets/img/failure.jpg';
        $finalImgF.setAttribute('alt', 'failure');

        this.stars = new Stars();
 

        cardItems.forEach(item => {
            let audio = getDescendant(item.dom, 'card_sound');
            this.cardsPlay.push(item.dom);

            this.audiosPlay.push(audio);
        })
console.log(this.audiosPlay)
        this.makeAudioPlayControls();
        if(!this.container.querySelector('.btn-play')) {
            let $btnPlay = makeElem('button', 'btn-play', 'start');
            let $btnIcon = makeElem('span', 'material-icons', 'replay');
            $btnPlay.appendChild($btnIcon);
            $btnPlay.addEventListener('click', this.handlePlay.bind(this, $btnIcon));
            this.container.after($btnPlay);
        }
    }

    handlePlay(...args) {
        this.mixedAudios = randomArr(this.audiosPlay);
        playSound(this.mixedAudios[0]);
        let repeat = this.mixedAudios.shift();
        const btnPlay = args[1].target;
        btnPlay.innerHTML = '';
        console.log(args)
        btnPlay.appendChild(args[0]);
        this.word = repeat.getAttribute('data-route')
        this.handleTimer(this.mixedAudios, 8000, false);
        args[0].addEventListener('click', this.handleCardSound.bind(this));

        this.cardsPlay.forEach(item => {
            item.addEventListener('click', this.handleCard.bind(this));
        })
    }

    handleTimer( audios, delay, clear ) {
        const makeTimer = (arr, timer) => setTimeout(() => {
            let repeat = arr.shift();
            this.word = repeat.getAttribute('data-route');
            playSound(repeat);
            makeTimer(arr, timer);
        }, timer);

        const clearTimer = (timer) => {
            clearTimeout(timer);
        }

        if(clear) {
            clearTimer(makeTimer);
        } else {
            makeTimer(audios, delay);
        }
    }


    handleCardSound(e) {
        e.stopPropagation();
        playSound(repeat);
        this.handleTimer(null, null, true);
    }

    makeCategoryPage(index) {
        this.container.innerHTML = '';
        let cardItems = [];
        cards[index].forEach(item => {
            let itemCard = new Card(item.word, item.translation);
            itemCard.dom = (this.mode === 'train') ? itemCard.makeCardTrain() : itemCard.makeCardPlay();
            cardItems.push(itemCard);
            this.container.appendChild(itemCard.dom);
        })
        if (this.mode === 'train') { } else {
            this.makePlay(cardItems);
        }
        return cardItems;
    }

    makeMain() {
        this.container.innerHTML = '';
        let catItems = [];
        categories.forEach(item => {
            let itemCat = new Category(item.image, item.name);
            itemCat.dom = itemCat.makeCategory(this.mode);
            catItems.push(itemCat);

            itemCat.dom.addEventListener('click', this.handleCategory.bind(this, item.index));

            this.container.appendChild(itemCat.dom);
        })
        return catItems;
    }
}