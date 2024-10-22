ESBUILD ?= node_modules/.bin/esbuild

OUTPUTS=output/MinimaxCPU.js output/MonteCarloCPU.js

all: $(OUTPUTS)

output/%-iife.js: src/%.js src/*.js
	$(ESBUILD) --bundle --target=es6 --format=iife --outfile=$@ $<

output/%-bundle.js: output/%-iife.js
	sed -e '/^(() => {$$/d; s/^  //; /})();/d' $< >$@

output/%.js: data/%-header.txt output/%-bundle.js
	cat $^ >$@

clean:
	rm -f -- $(OUTPUTS)

.PHONY: all clean
