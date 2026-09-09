# Problemas conocidos y soluciones aplicadas

Antes de depurar algo, mirar aquí primero.

| # | Problema | Causa | Fix / prevención |
|---|---|---|---|
| 1 | `typescript/no-floating-promises` y `no-misused-promises` configuradas en `.oxlintrc.json` y sin detectar ni una promesa flotante. El lint pasaba en verde con código que sí tenía el fallo. | Son reglas *type-aware*: necesitan información de tipos. oxlint **acepta la configuración sin protestar** pero no las ejecuta si no encuentra `oxlint-tsgolint`. Falla en silencio: sin error, sin aviso, sin regla. | `oxlint-tsgolint` como devDependency y `lint` = `oxlint --type-aware`. Para comprobar que una regla type-aware está viva, escribir un fichero con la violación a propósito y ver que salta; que aparezca en la config no prueba nada. |
| 2 | `react/react-in-jsx-scope` marcaba error en todo el árbol JSX al activar la categoría `correctness`. | La regla es de la era del transform clásico, cuando `<div/>` compilaba a `React.createElement`. Con `"jsx": "react-jsx"` React no necesita estar en scope. | Desactivada explícitamente en `.oxlintrc.json`. |
