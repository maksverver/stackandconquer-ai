ROLLUP ?= node_modules/.bin/rollup

OUTPUTS=output/MinimaxCPU.js output/MonteCarloCPU.js

all: $(OUTPUTS)

output/%-bundle.js: src/%.js src/*.js
	$(ROLLUP) --validate -i "$<" | grep -v '^export ' > "$@"

output/%.js: data/%-header.txt output/%-bundle.js
	cat $^ >$@

clean:
	rm -f -- $(OUTPUTS)

.PHONY: all clean
