ROLLUP ?= node_modules/.bin/rollup

OUTPUTS=output/MinimaxCPU.js output/MonteCarloCPU.js

all: $(OUTPUTS)

output/%-bundle.js: src/%.js src/*.js
	$(ROLLUP) --validate -i "$<" | grep -v '^export ' > "$@"

output/%.js: data/%-header.txt output/%-bundle.js
	cat $^ >$@

lint:
	npm run lint

test:
	npm run test

clean:
	rm -f -- $(OUTPUTS)

.PHONY: all lint test clean
