import React, { Component } from 'react';
import axios from 'axios';
import {
	Icon,
	Table,
	Container,
	Header,
	Image,
	Input,
	Form,
	Button,
	Pagination
} from 'semantic-ui-react';

class App extends Component {
	state = {
		currencies: [],
		selected: '',
		current: 0,
		limit: 5,
		activeListOfCurrencies: [],
		myBalance: [],
		activePage: 1,
		loading: false
	};

	componentDidMount() {
		this.getCryptoCurrencies();

		setInterval(() => {
			this.setState(
				{
					currencies: [],
					selected: '',
					current: 0,
					limit: 5,
					activeListOfCurrencies: [],
					myBalance: [],
					activePage: 1
				},
				() => this.getCryptoCurrencies()
			);
		}, 30000);
	}

	getCryptoCurrencies = () => {
		this.setState({ loading: true });
		axios
			.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd')
			.then(({ data }) => {
				let initialBalance;

				if (localStorage.getItem('myBalance')) {
					initialBalance = JSON.parse(localStorage.getItem('myBalance'));
				} else {
					initialBalance = data.map(el => ({ id: el.id, balance: 0 }));
				}

				this.setState(
					{
						currencies: data,
						myBalance: [...this.state.myBalance, ...initialBalance],
						loading: false
					},
					() => {
						this.getListOfCurrencies();
					}
				);
			});
	};

	handleOnChnage = e => {
		this.setState({
			current: +e.target.value
		});
	};

	handleOnSubmit = (e, currency) => {
		e.preventDefault();

		const { myBalance, current, selected } = this.state;

		const newValue = {
			id: selected,
			balance: +(current * currency).toFixed(2)
		};

		// check if there are duplicates
		const newArray = myBalance.filter(el => el.id !== selected);

		this.setState(
			{
				myBalance: [...newArray, newValue]
			},
			() => {
				localStorage.setItem(
					'myBalance',
					JSON.stringify([...newArray, newValue])
				);
			}
		);
	};

	getListOfCurrencies = () => {
		const { currencies, limit, activePage } = this.state;

		this.setState({
			activeListOfCurrencies: currencies.slice(
				activePage * limit - limit,
				activePage * limit
			)
		});
	};

	render() {
		return (
			<Container textAlign="center">
				<div className="App">
					<Header as="h1">First Header</Header>

					{this.state.loading ? (
						<h1>loding..</h1>
					) : (
						<>
							<Form>
								<Form.Field inline>
									<label>Limit</label>
									<Input
										placeholder="First name"
										onChange={e => this.setState({ limit: e.target.value })}
									/>

									<Button onClick={() => this.getListOfCurrencies()} secondary>
										Submit
									</Button>
								</Form.Field>
							</Form>

							<Table celled>
								<Table.Header>
									<Table.Row>
										<Table.HeaderCell>Id</Table.HeaderCell>
										<Table.HeaderCell>Image</Table.HeaderCell>
										<Table.HeaderCell>Price</Table.HeaderCell>
										<Table.HeaderCell>Price last 24h</Table.HeaderCell>
										<Table.HeaderCell>No</Table.HeaderCell>
										<Table.HeaderCell>Your balance</Table.HeaderCell>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{this.state.activeListOfCurrencies.map((crypto, id) => {
										return (
											<Table.Row key={id + 1}>
												<Table.Cell> {crypto.id}</Table.Cell>
												<Table.Cell>
													<Image src={crypto.image} size="small" />
												</Table.Cell>
												<Table.Cell>
													{' '}
													${crypto.current_price.toFixed(2)}
												</Table.Cell>
												<Table.Cell>
													{crypto.price_change_percentage_24h < 0 ? (
														<span style={{ color: 'red' }}>
															{crypto.price_change_percentage_24h.toFixed(2)}%
														</span>
													) : (
														<span style={{ color: 'green' }}>
															{crypto.price_change_percentage_24h.toFixed(2)}%
														</span>
													)}
												</Table.Cell>
												<Table.Cell>
													<Form
														onSubmit={e =>
															this.handleOnSubmit(e, crypto.current_price)
														}>
														<Input
															placeholder="Quantity"
															name="current"
															type="number"
															onFocus={() =>
																this.setState({ selected: crypto.id })
															}
															onChange={this.handleOnChnage}
														/>

														<Button
															animated
															color="teal"
															disabled={
																this.state.selected === crypto.id ? false : true
															}>
															<Button.Content visible>Submit</Button.Content>
															<Button.Content hidden>
																<Icon name="arrow right" />
															</Button.Content>
														</Button>
													</Form>
												</Table.Cell>
												<Table.Cell>
													{this.state.myBalance.map((el, id) => {
														if (el.id === crypto.id) {
															return <span key={id + 1}>{el.balance}</span>;
														}
													})}
												</Table.Cell>
											</Table.Row>
										);
									})}
								</Table.Body>
							</Table>
						</>
					)}
				</div>
			</Container>
		);
	}
}

export default App;
