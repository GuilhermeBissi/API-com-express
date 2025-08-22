all: build run clear

git:
	@echo "=== Configurações para Git ==="
	git config --global user.email "20233005484@estudantes.ifpr.edu.br"	
	git config --global user.name "GuilhermeBissi"

clean:
	rm -rf bin