import React, {Component} from 'react'
import './Calculator.css'

import Button from '../components/Button'
import Display from '../components/Display'
import CalculateDisplay from '../components/CalculateDisplay'

const initialState = {
    displayCalculate: '0',//valor a ser mostrado do calculo a ser executado
    displayValue: '0',//valor a ser mostrado no display
    clearDisplay: false,//limpar ou não o display
    operation:null,//dígito simboliza uma operação
    values:[0,0],//vetor que armazena os valores a serem computados
    current: 0//indica a posição que o valor atual deve ser armazenado no vetor
}


export default class Calculator extends Component{

    state = {...initialState}

    constructor(props){
        super(props)
        this.clearMemory = this.clearMemory.bind(this)
        this.setOperation = this.setOperation.bind(this)
        this.addDigit = this.addDigit.bind(this)
    }

    /*
    Função transforma o parametro em uma representação em notação científica (potências de 10)
    ex: num = 310000 => retorno {3.1 , 5} => em notação científica: 3.1 * 10^5
    */
    pot10(num) {
        var exponent=0
        while(num>=10){
            num = num/10
            exponent ++
        }
        return {num, exponent}
    }



    clearMemory(){
        this.setState({...initialState})
    }

    setOperation(operation){

        if(operation === 'xʸ'){operation = '^'}
        //alteramos para esse simbolo para aparecer no display


        const currentOperation = this.state.operation
        const equals = operation === '='
        var displayCalculate = this.state.displayCalculate

        if(currentOperation === '^' && operation === '-'){
            this.addDigit('-')
            return
        }
        //aqui tratamos do caso em que temos um expoente negativo, adicionamos o negativo ao valor que será digitado

        displayCalculate = equals ? '' : displayCalculate + operation
        //garantimos que quando o usuário digite uma operação com o resultado do calculo anterior, ele apareça no display de calculo

        if (currentOperation === '=' && !equals){
            displayCalculate = this.state.displayValue + operation
        }

        if(this.state.current === 0){

            this.setState({displayCalculate, operation, current:1, clearDisplay:true})
            //alteramos para current = 1, para que o proximo valor seja armazenado na segunda posição do vetor

        }else{

            const values = [...this.state.values]
            //realizamos as operações
            
            try{
                if(currentOperation === '+'){values[0] = (values[0] + values[1])}
                if(currentOperation === '-'){values[0] = (values[0] - values[1])}
                if(currentOperation === '/'){values[0] = (values[0] / values[1])}
                if(currentOperation === '*'){values[0] = (values[0] * values[1])}
                if(currentOperation === '^'){values[0] = Math.pow(values[0], values[1])}
            }catch(e){
                values[0] = this.state.values[0]
            }
            
            values[1] = 0

            //restringimos o numero de casas decimais mostradas no display para no máximo 8 casas decimais

            var num = values[0]
            var displayValue = ""+(values[0])
            
            displayValue = this.checkDigitLimit(num, displayValue)
                
            //atualizamos o estado da aplicação
            this.setState({
                displayCalculate: displayCalculate,
                displayValue: displayValue,
                operation: operation,
                current: equals ? 0 : 1,
                clearDisplay: !equals,
                values
            })
            
        }
        
    }

    /*
    Função que checa a quantidade digitos do numero, para que não ultrapasse a representção do display
    Problemas checados: 
    - valores na ordem de 10^9 ou mais são representados na forma exponencial base 10
    - valores com quantidade de digitos maiores que 9 são simplificados (arredondamos casa decimal para que o valor se ajuste no display)
    Retorno: valor a ser mostrado no display
    */

    checkDigitLimit(num, displayValue){
        
        if(num>999999999){
            const pot = this.pot10(num)
            displayValue = ''+(+pot.num.toFixed(5))+'e'+pot.exponent
        }
        else if(displayValue.length>=10){
            const index = displayValue.indexOf('.')
            displayValue = ''+(+num.toFixed(9 - index))
        }

        return displayValue
    }


    addDigit(n){

        //caso já tenha um ponto, devemos ignorar a tentativa de colocar novamente
        if (n === '.' && this.state.displayValue.includes('.')){
            return
        }

        //evitar numeros como 01 (devemos colocar apenas 1 no display)
        const zeroDisplay = this.state.displayValue === '0'
        const clearDisplay = this.state.clearDisplay
        var currentValue
        
        //garantir que o ponto após o zero seja reconhecido e impedir que aconteça de ficar um valor com zero à esquerda
        const displayCalculate = (this.state.displayCalculate === '0' && n!== '.') ?  n : this.state.displayCalculate + n

        //quando temos um numero como 0.1, queremos que apareça o valor 0. e não apenas .
        //para os outros casos, não queremos o zero à esquerda
        if(zeroDisplay && n === '.'){
            currentValue = this.state.displayValue
        }else{
            currentValue = (clearDisplay||zeroDisplay) ? '' : this.state.displayValue
        }
        
        //adicionamos o novo digito ao valor do display
        var displayValue = currentValue + n

        //var num = this.state.values[this.state.current]
        
        var num = parseFloat(''+this.state.values[this.state.current]+n)
        //num recebe a representação float do elemento em values com o algarismo digitado (displayValue não pode ser usado pois ele pode estar em notação cientifica)
        //Por outro lado, em values armazenamos os valores em suas representações originais, portanto ele deve ser utilizado
        //essa variavel será analisada a fim de transformá-la ou não em uma notação científica ou se será limitada em 9 dígitos

        //fazemos a checagem do limite de dígitos
        displayValue = this.checkDigitLimit(num, displayValue)

        this.setState({displayCalculate, displayValue, clearDisplay: false})
        //atualizamos o estado do display com o seu novo valor

        if(n!=='.'){
            //para garantir que iremos adicionar o valor na posição correta do vetor values
            const i = this.state.current
            const values = [...this.state.values]
            //const newValue = (displayValue.includes('-')) ? -parseFloat(''+values[i]+n): parseFloat(''+values[i]+n)
            //mantemos o numero em sua representação não exponencial no vetor de 
            var newValue = parseFloat(''+values[i]+n)
            if (displayValue.includes('-')){
                newValue = (newValue < 0) ? newValue : newValue*(-1)
            }
            values[i] = newValue
            this.setState({values})
        }
    }



    render(){
        return (
            <div className = "calculator">
                <CalculateDisplay value={this.state.displayCalculate}/>
                <Display value={this.state.displayValue} />
                <Button label="AC" click = {this.clearMemory} double/>
                <Button label="xʸ" click = {this.setOperation} operation/>
                <Button label="/" click = {this.setOperation} operation/>
                <Button label="7" click = {this.addDigit}/>
                <Button label="8" click = {this.addDigit}/>
                <Button label="9" click = {this.addDigit}/>
                <Button label="*" click = {this.setOperation} operation/>
                <Button label="4" click = {this.addDigit}/>
                <Button label="5" click = {this.addDigit}/>
                <Button label="6" click = {this.addDigit}/>
                <Button label="-" click = {this.setOperation} operation/>
                <Button label="2" click = {this.addDigit}/>
                <Button label="3" click = {this.addDigit}/>
                <Button label="1" click = {this.addDigit}/>
                <Button label="+" click = {this.setOperation} operation/>
                <Button label="0" click = {this.addDigit} double/>
                <Button label="." click = {this.addDigit}/>
                <Button label="=" click = {this.setOperation} operation/>
            </div>
        )
    }
}
