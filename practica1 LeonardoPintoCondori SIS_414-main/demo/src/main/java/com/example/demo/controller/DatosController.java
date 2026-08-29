package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping
public class DatosController {

    @GetMapping("/saludo")
    public Map<String, Object> obtenerNombre() {

        Map<String, Object> lista = new LinkedHashMap<>();

        lista.put("Nombres", "Gustavo Leonardo");
        lista.put("Apellidos", "Pinto Condori");
        lista.put("Edad", 22);
        lista.put("Fecha de nacimiento", "22/07/2004");
        lista.put("CI", "13102030");
        lista.put("RU", "113847");
        lista.put("Celular 1", "+591 78636362");
        lista.put("Celular 2", "+591 74201216");

        List<Map<String, String>> materias = new ArrayList<>();

        Map<String, String> mat1 = new LinkedHashMap<>();
        mat1.put("Materia", "TECNOLOGIAS EMERGENTES");
        mat1.put("Grupo", "G-2");
        mat1.put("Sigla", "SIS-414");
        materias.add(mat1);

        Map<String, String> mat2 = new LinkedHashMap<>();
        mat2.put("Materia", "ANALISIS DE SISTEMAS I");
        mat2.put("Grupo", "G-1");
        mat2.put("Sigla", "SIS-416");
        materias.add(mat2);

        Map<String, String> mat3 = new LinkedHashMap<>();
        mat3.put("Materia", "SISTEMAS DIGITALES");
        mat3.put("Grupo", "G-1");
        mat3.put("Sigla", "SIS-420");
        materias.add(mat3);

        Map<String, String> mat4 = new LinkedHashMap<>();
        mat4.put("Materia", "INVESTIGACION OPERATIVA I");
        mat4.put("Grupo", "G-1");
        mat4.put("Sigla", "SIS-443");
        materias.add(mat4);

        Map<String, String> mat5 = new LinkedHashMap<>();
        mat5.put("Materia", "TALLER DE BASE DE DATOS");
        mat5.put("Grupo", "G-1");
        mat5.put("Sigla", "SIS-518");
        materias.add(mat5);

        lista.put("Programacion de Materias", materias);

        return lista;
    }
}