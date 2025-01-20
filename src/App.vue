<script setup>
import * as THREE from 'three';
import { ref } from 'vue';
import sceneScript from './script.vue';



</script>

<template>
    <div class="grid justify-items-center w-screen h-fit">
        <img alt="navbar" src="/navbar.png" widht="300" class="absolute w-[352px] p-[20px] translate-y-[4px] translate-x-[-2px] select-none"/>
        <img alt="navbar" src="/info.png" widht="300" class="absolute w-[80px] p-[20px] translate-y-[690px] translate-x-[136px] select-none"/>
    </div>
    <div class="grid justify-items-center w-screen h-fit translate-y-[600px] select-none">
        <h2 class="absolute font-display text-primary-dark text-2xl">146 minutter</h2>
        <h2 class="absolute font-light text-primary-dark text-2xl translate-y-[30px]">Torsdag d. 23.1.25</h2>
    </div>
    <canvas class="webgl"></canvas>
    <sceneScript></sceneScript>

</template>

