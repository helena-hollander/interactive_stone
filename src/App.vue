<script setup>
import * as THREE from 'three';
import { ref } from 'vue';
import sceneScript from './script.vue';



</script>

<template>
    <div class="grid gird-cols-1 justify-items-center w-screen h-fit">
        <img alt="navbar" src="/navbar.png" widht="300" class="absolute w-[346px] p-[20px] translate-y-[10px] translate-x-[-4px] select-none"/>
    </div>
    <canvas class="webgl"></canvas>
    <sceneScript></sceneScript>

</template>

