import {execute} from '@/interpreter'

const programs = []

programs.push({name: 'bisect-basic', src: `(open P Q) (wut O)`})

/*
programs.push({name: 'bisect-basic', src: `
(open P Q)

(label (names R) (block
(label (names _ A) (intersection (arc Q) L))
(label (names _ B) (intersection (arc A) L))
(label (names _ C) (intersection (arc C) L)) C))

(label (names ThreeUnits) (length P R))
(open ThreeUnits)

(label (names A B) (intersection (arc R) (arc P)))
(label (names L1) (line A B))
(label (names S) (intersection  L1 L))

(output S) ; this is now the dividing point
`})
*/
programs.forEach(({name, src}) => {
    it ("Program - " + name, () => {
      execute(src)
    })
})
